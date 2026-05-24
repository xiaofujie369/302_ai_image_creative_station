import { GenerationMode, GenerationStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authError, requireUser } from "@/lib/server-auth";
import {
  assertEnoughCredits,
  debitCredits,
  estimateGenerationCost,
} from "@/services/creditService";
import { openaiImageService, resolveImageModel } from "@/services/openaiImageService";
import { assertGenerationRateLimit } from "@/services/rateLimitService";
import { saveImageBuffer } from "@/services/storageService";
import { asNumber, getSetting } from "@/lib/settings";

const schema = z.object({
  prompt: z.string().min(1),
  negative_prompt: z.string().max(1000).optional(),
  model: z.string().optional(),
  size: z.string().default("1024x1024"),
  quality: z.string().default("standard"),
  count: z.number().int().min(1).max(10).default(1),
  request_id: z.string().min(8).max(120),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    await assertGenerationRateLimit(request, user.id);

    const body = schema.parse(await request.json());
    const maxPromptLength = asNumber(await getSetting("security.prompt_max_length"), 2000);
    if (body.prompt.length > maxPromptLength) {
      return Response.json(
        { error: `Prompt must be ${maxPromptLength} characters or fewer.` },
        { status: 400 }
      );
    }

    const requestId = `${user.id}:${body.request_id}`;
    const existing = await prisma.generationLog.findUnique({
      where: { requestId },
    });
    if (existing) {
      return Response.json({ generation: existing, idempotent: true });
    }

    const model = await resolveImageModel(body.model);
    const cost = await estimateGenerationCost({
      mode: GenerationMode.TEXT_TO_IMAGE,
      model,
      quality: body.quality,
      count: body.count,
    });
    await assertEnoughCredits(user.id, cost);

    const finalPrompt = body.negative_prompt
      ? `${body.prompt}\n\nAvoid: ${body.negative_prompt}`
      : body.prompt;

    const log = await prisma.generationLog.create({
      data: {
        userId: user.id,
        requestId,
        prompt: body.prompt,
        negativePrompt: body.negative_prompt,
        mode: GenerationMode.TEXT_TO_IMAGE,
        model,
        size: body.size,
        quality: body.quality,
        costCredits: cost,
        status: GenerationStatus.PENDING,
      },
    });

    try {
      const images = await openaiImageService.generate({
        prompt: finalPrompt,
        model,
        size: body.size,
        quality: body.quality,
        count: body.count,
      });
      const urls = await Promise.all(
        images.map((image) =>
          saveImageBuffer({
            buffer: image.buffer,
            contentType: image.contentType,
            prefix: "generated",
          })
        )
      );

      const updated = await prisma.$transaction(async (tx) => {
        await debitCredits(tx, {
          userId: user.id,
          amount: cost,
          description: `Image generation using ${model}`,
        });
        return tx.generationLog.update({
          where: { id: log.id },
          data: {
            status: GenerationStatus.SUCCESS,
            outputImageUrl: urls[0],
          },
        });
      });

      return Response.json({ generation: updated, images: urls, cost });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Image generation failed. Please try again.";
      await prisma.generationLog.update({
        where: { id: log.id },
        data: {
          status: GenerationStatus.FAILED,
          errorMessage: message,
        },
      });
      return Response.json(
        {
          error:
            model === "gpt-image-2"
              ? `gpt-image-2 generation failed: ${message}`
              : message,
        },
        { status: 502 }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.flatten() }, { status: 400 });
    }
    if (error instanceof Error) {
      if (error.message === "INSUFFICIENT_CREDITS") {
        return Response.json({ error: "Insufficient credits" }, { status: 402 });
      }
      if (error.message === "RATE_LIMITED") {
        return Response.json({ error: "Too many generation requests" }, { status: 429 });
      }
    }
    return authError(error);
  }
}
