import { readFile } from "fs/promises";
import path from "path";

export async function GET(
  _request: Request,
  { params }: { params: { path: string[] } }
) {
  const uploadDir = path.resolve(process.cwd(), process.env.LOCAL_UPLOAD_DIR || "./uploads");
  const filePath = path.resolve(uploadDir, ...params.path);
  const relativePath = path.relative(uploadDir, filePath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const file = await readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();
    const contentType =
      extension === ".jpg" || extension === ".jpeg"
        ? "image/jpeg"
        : extension === ".webp"
          ? "image/webp"
          : "image/png";
    return new Response(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
