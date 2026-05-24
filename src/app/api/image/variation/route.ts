import { GenerationMode, GenerationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { authError, requireUser } from "@/lib/server-auth";
import {
  assertEnoughCredits,
  debitCredits,
  estimateGenerationCost,
} from "@/services/creditService";
import { openaiImageService, resolveImageModel } from "@/services/openaiImageService";
import { assertGenerationRateLimit } from "@/services/rateLimitService";
import { assertAllowedImage, saveFile, saveImageBuffer } from "@/services/storageService";
import { asNumber, getSetting } from "@/lib/settings";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    await assertGenerationRateLimit(request, user.id);

    const form = await request.formData();
    const image = form.get("image");
    const size = String(form.get("size") || "1024x1024");
    const count = Math.max(1, Math.min(Number(form.get("count") || 1), 10));
    const requestValue = form.get("request_id");
    const requestId = typeof requestValue === "string" ? `${user.id}:${requestValue}` : "";

    if (
      typeof requestValue !== "string" ||
      requestValue.length < 8 ||
      requestValue.length > 120
    ) {
      return Response.json({ error: "request_id is required" }, { status: 400 });
    }
    if (!(image instanceof File)) {
      return Response.json({ error: "Input image is required" }, { status: 400 });
    }
    assertAllowedImage(image, asNumber(await getSetting("security.upload_max_mb"), 10));

    const existing = await prisma.generationLog.findUnique({ where: { requestId } });
    if (existing) return Response.json({ generation: existing, idempotent: true });

    const model = await resolveImageModel(String(form.get("model") || ""));
    const cost = await estimateGenerationCost({
      mode: GenerationMode.VARIATION,
      model,
      count,
    });
    await assertEnoughCredits(user.id, cost);

    const inputImageUrl = await saveFile(image, "input");
    const log = await prisma.generationLog.create({
      data: {
        userId: user.id,
        requestId,
        prompt: "Image variation",
        mode: GenerationMode.VARIATION,
        model,
        size,
        inputImageUrl,
        costCredits: cost,
        status: GenerationStatus.PENDING,
      },
    });

    try {
      const images = await openaiImageService.variation({ image, model, size, count });
      const urls = await Promise.all(
        images.map((result) =>
          saveImageBuffer({
            buffer: result.buffer,
            contentType: result.contentType,
            prefix: "generated",
          })
        )
      );

      const updated = await prisma.$transaction(async (tx) => {
        await debitCredits(tx, {
          userId: user.id,
          amount: cost,
          description: `Image variation using ${model}`,
        });
        return tx.generationLog.update({
          where: { id: log.id },
          data: { status: GenerationStatus.SUCCESS, outputImageUrl: urls[0] },
        });
      });

      return Response.json({ generation: updated, images: urls, cost });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Image variation failed";
      await prisma.generationLog.update({
        where: { id: log.id },
        data: { status: GenerationStatus.FAILED, errorMessage: message },
      });
      return Response.json({ error: message }, { status: 502 });
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INSUFFICIENT_CREDITS") {
        return Response.json({ error: "Insufficient credits" }, { status: 402 });
      }
      if (error.message === "RATE_LIMITED") {
        return Response.json({ error: "Too many generation requests" }, { status: 429 });
      }
      if (
        error.message === "UNSUPPORTED_IMAGE_TYPE" ||
        error.message === "IMAGE_TOO_LARGE" ||
        error.message === "INVALID_IMAGE_SIGNATURE"
      ) {
        return Response.json({ error: error.message }, { status: 400 });
      }
    }
    return authError(error);
  }
}
