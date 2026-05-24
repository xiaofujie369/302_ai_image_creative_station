import { getSetting } from "@/lib/settings";

export const SUPPORTED_IMAGE_MODELS = [
  "gpt-image-2",
  "gpt-image-1.5",
  "gpt-image-1-mini",
] as const;

export type SupportedImageModel = (typeof SUPPORTED_IMAGE_MODELS)[number];

export interface GeneratedImage {
  buffer: Buffer;
  contentType: string;
  revisedPrompt?: string;
}

export interface ImageProvider {
  generate(input: {
    prompt: string;
    model: string;
    size?: string;
    quality?: string;
    count?: number;
  }): Promise<GeneratedImage[]>;
  edit(input: {
    prompt: string;
    image: File;
    model: string;
    size?: string;
    quality?: string;
    count?: number;
  }): Promise<GeneratedImage[]>;
  variation(input: {
    image: File;
    model: string;
    size?: string;
    count?: number;
  }): Promise<GeneratedImage[]>;
}

function getOpenAIKey() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  return apiKey;
}

function normalizeModel(model: string): SupportedImageModel {
  if (SUPPORTED_IMAGE_MODELS.includes(model as SupportedImageModel)) {
    return model as SupportedImageModel;
  }
  throw new Error(`Unsupported image model: ${model}`);
}

async function parseOpenAIImages(payload: any): Promise<GeneratedImage[]> {
  const items = Array.isArray(payload?.data) ? payload.data : [];
  if (!items.length) {
    throw new Error("OpenAI did not return any image data");
  }

  return Promise.all(
    items.map(async (item: any) => {
      if (item.b64_json) {
        return {
          buffer: Buffer.from(item.b64_json, "base64"),
          contentType: "image/png",
          revisedPrompt: item.revised_prompt,
        };
      }
      if (item.url) {
        const response = await fetch(item.url);
        if (!response.ok) {
          throw new Error("Failed to download generated image from OpenAI URL");
        }
        return {
          buffer: Buffer.from(await response.arrayBuffer()),
          contentType: response.headers.get("content-type") || "image/png",
          revisedPrompt: item.revised_prompt,
        };
      }
      throw new Error("OpenAI image response did not include b64_json or url");
    })
  );
}

async function openAIJson(path: string, body: Record<string, unknown>) {
  const response = await fetch(`https://api.openai.com/v1${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getOpenAIKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      payload?.error?.message ||
      `OpenAI image request failed with status ${response.status}`;
    throw new Error(message);
  }
  return payload;
}

async function openAIForm(path: string, formData: FormData) {
  const response = await fetch(`https://api.openai.com/v1${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getOpenAIKey()}`,
    },
    body: formData,
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      payload?.error?.message ||
      `OpenAI image request failed with status ${response.status}`;
    throw new Error(message);
  }
  return payload;
}

export const openaiImageService: ImageProvider = {
  async generate(input) {
    const model = normalizeModel(input.model);
    const payload = await openAIJson("/images/generations", {
      model,
      prompt: input.prompt,
      size: input.size || "1024x1024",
      quality: input.quality || "standard",
      n: Math.max(1, Math.min(input.count || 1, 10)),
      response_format: "b64_json",
    });
    return parseOpenAIImages(payload);
  },

  async edit(input) {
    const model = normalizeModel(input.model);
    const form = new FormData();
    form.append("model", model);
    form.append("prompt", input.prompt);
    form.append("image", input.image, input.image.name || "input.png");
    form.append("size", input.size || "1024x1024");
    form.append("quality", input.quality || "standard");
    form.append("n", String(Math.max(1, Math.min(input.count || 1, 10))));
    form.append("response_format", "b64_json");

    const payload = await openAIForm("/images/edits", form);
    return parseOpenAIImages(payload);
  },

  async variation(input) {
    const model = normalizeModel(input.model);
    const form = new FormData();
    form.append("model", model);
    form.append("image", input.image, input.image.name || "input.png");
    form.append("size", input.size || "1024x1024");
    form.append("n", String(Math.max(1, Math.min(input.count || 1, 10))));
    form.append("response_format", "b64_json");

    const payload = await openAIForm("/images/variations", form);
    return parseOpenAIImages(payload);
  },
};

export async function resolveImageModel(requested?: string | null) {
  const defaultModel =
    process.env.OPENAI_IMAGE_DEFAULT_MODEL ||
    (await getSetting("openai.image.default_model")) ||
    "gpt-image-2";
  return normalizeModel(requested || defaultModel);
}
