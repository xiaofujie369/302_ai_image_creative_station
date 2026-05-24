import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export function assertAllowedImage(file: File, maxMb: number) {
  if (!allowedMimeTypes.has(file.type)) {
    throw new Error("UNSUPPORTED_IMAGE_TYPE");
  }
  if (file.size > maxMb * 1024 * 1024) {
    throw new Error("IMAGE_TOO_LARGE");
  }
}

function assertImageBuffer(buffer: Buffer, mimeType: string) {
  const isPng =
    buffer.length > 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47;
  const isJpeg = buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8;
  const isWebp =
    buffer.length > 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP";

  if (
    (mimeType === "image/png" && !isPng) ||
    (mimeType === "image/jpeg" && !isJpeg) ||
    (mimeType === "image/webp" && !isWebp)
  ) {
    throw new Error("INVALID_IMAGE_SIGNATURE");
  }
}

function extensionFor(mimeType: string) {
  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/webp") return "webp";
  return "png";
}

function publicUploadUrl(key: string) {
  const base = process.env.PUBLIC_UPLOAD_BASE_URL || "/uploads";
  return `${base.replace(/\/$/, "")}/${key.replace(/\\/g, "/")}`;
}

async function putLocal(buffer: Buffer, key: string) {
  const uploadDir = process.env.LOCAL_UPLOAD_DIR || "./uploads";
  const filePath = path.join(process.cwd(), uploadDir, key);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, buffer);
  return publicUploadUrl(key);
}

async function putS3(buffer: Buffer, key: string, contentType: string) {
  const bucket = process.env.S3_BUCKET;
  if (!bucket) return null;

  const client = new S3Client({
    endpoint: process.env.S3_ENDPOINT || undefined,
    region: process.env.S3_REGION || "auto",
    forcePathStyle: Boolean(process.env.S3_ENDPOINT),
    credentials:
      process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
          }
        : undefined,
  });

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  const publicBase = process.env.S3_PUBLIC_URL;
  return publicBase ? `${publicBase.replace(/\/$/, "")}/${key}` : null;
}

export async function saveImageBuffer(input: {
  buffer: Buffer;
  contentType?: string;
  prefix?: string;
}) {
  const contentType = input.contentType || "image/png";
  const key = `${input.prefix || "generated"}/${new Date()
    .toISOString()
    .slice(0, 10)}/${randomUUID()}.${extensionFor(contentType)}`;

  const s3Url = await putS3(input.buffer, key, contentType);
  if (s3Url) return s3Url;

  return putLocal(input.buffer, key);
}

export async function saveFile(file: File, prefix = "uploads") {
  const arrayBuffer = await file.arrayBuffer();
  assertImageBuffer(Buffer.from(arrayBuffer), file.type);
  return saveImageBuffer({
    buffer: Buffer.from(arrayBuffer),
    contentType: file.type,
    prefix,
  });
}

export function dataUrlToBuffer(dataUrl: string) {
  const [, meta = "", data = ""] =
    dataUrl.match(/^data:(.*?);base64,(.*)$/) || [];
  return {
    buffer: Buffer.from(data || dataUrl, "base64"),
    contentType: meta || "image/png",
  };
}
