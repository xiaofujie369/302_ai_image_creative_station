"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { ImagePlus, Paintbrush, Sparkles } from "lucide-react";

type Mode = "text" | "edit" | "variation";

const models = ["gpt-image-2", "gpt-image-1.5", "gpt-image-1-mini"];
const modeOptions = [
  { value: "text" as const, label: "Text to image", Icon: Sparkles },
  { value: "edit" as const, label: "Image edit", Icon: Paintbrush },
  { value: "variation" as const, label: "Variation", Icon: ImagePlus },
];

export default function GenerateClient({
  credits,
  defaultModel,
  costs,
}: {
  credits: number;
  defaultModel: string;
  costs: {
    text: number;
    edit: number;
    variation: number;
    hd: number;
    gptImage2Multiplier: number;
  };
}) {
  const [mode, setMode] = useState<Mode>("text");
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [model, setModel] = useState(defaultModel);
  const [size, setSize] = useState("1024x1024");
  const [quality, setQuality] = useState("standard");
  const [count, setCount] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const estimatedCost = useMemo(() => {
    const base =
      mode === "edit" ? costs.edit : mode === "variation" ? costs.variation : costs.text;
    const hd = quality === "hd" || quality === "high" ? costs.hd : 0;
    const multiplier = model === "gpt-image-2" ? costs.gptImage2Multiplier : 1;
    return Math.ceil((base + hd) * count * multiplier);
  }, [mode, costs, quality, count, model]);

  function onFile(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] || null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setImages([]);

    const requestId = crypto.randomUUID();
    let response: Response;
    if (mode === "text") {
      response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          negative_prompt: negativePrompt || undefined,
          model,
          size,
          quality,
          count,
          request_id: requestId,
        }),
      });
    } else {
      const formData = new FormData();
      formData.append("model", model);
      formData.append("size", size);
      formData.append("quality", quality);
      formData.append("count", String(count));
      formData.append("request_id", requestId);
      if (prompt) formData.append("prompt", prompt);
      if (file) formData.append("image", file);
      response = await fetch(mode === "edit" ? "/api/image/edit" : "/api/image/variation", {
        method: "POST",
        body: formData,
      });
    }

    const data = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Generation failed. Please try again.");
      return;
    }
    setImages(data.images || (data.generation?.outputImageUrl ? [data.generation.outputImageUrl] : []));
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="rounded-lg border bg-white p-5 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-3">
          {modeOptions.map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              className={`flex items-center justify-center gap-2 rounded-md border px-3 py-3 text-sm font-medium ${
                mode === value ? "border-slate-950 bg-slate-950 text-white" : "bg-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {mode !== "variation" && (
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            maxLength={2000}
            required
            placeholder="Describe the image you want to create..."
            className="mt-5 min-h-40 w-full rounded-md border p-4 text-sm outline-none focus:ring-2 focus:ring-slate-900"
          />
        )}
        {mode === "text" && (
          <textarea
            value={negativePrompt}
            onChange={(event) => setNegativePrompt(event.target.value)}
            maxLength={1000}
            placeholder="Optional negative prompt..."
            className="mt-3 min-h-20 w-full rounded-md border p-4 text-sm outline-none focus:ring-2 focus:ring-slate-900"
          />
        )}
        {mode !== "text" && (
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={onFile}
            required
            className="mt-5 w-full rounded-md border bg-white p-3 text-sm"
          />
        )}
        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {images.length > 0 && (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {images.map((url) => (
              <img key={url} src={url} alt="Generated output" className="rounded-lg border" />
            ))}
          </div>
        )}
      </section>

      <aside className="rounded-lg border bg-white p-5 shadow-sm">
        <div className="rounded-md bg-slate-100 p-4">
          <p className="text-sm text-slate-600">Current balance</p>
          <p className="mt-1 text-3xl font-semibold">{credits} credits</p>
        </div>
        <label className="mt-5 block text-sm font-medium">Model</label>
        <select
          value={model}
          onChange={(event) => setModel(event.target.value)}
          className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
        >
          {models.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <label className="mt-4 block text-sm font-medium">Size</label>
        <select
          value={size}
          onChange={(event) => setSize(event.target.value)}
          className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
        >
          <option>1024x1024</option>
          <option>1536x1024</option>
          <option>1024x1536</option>
        </select>
        <label className="mt-4 block text-sm font-medium">Quality</label>
        <select
          value={quality}
          onChange={(event) => setQuality(event.target.value)}
          className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
        >
          <option value="standard">Standard</option>
          <option value="hd">HD</option>
        </select>
        <label className="mt-4 block text-sm font-medium">Images</label>
        <input
          type="number"
          min={1}
          max={10}
          value={count}
          onChange={(event) => setCount(Number(event.target.value))}
          className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
        />
        <div className="mt-5 rounded-md border p-4">
          <p className="text-sm text-slate-600">Estimated cost</p>
          <p className="mt-1 text-2xl font-semibold">{estimatedCost} credits</p>
        </div>
        {credits < estimatedCost ? (
          <a
            href="/pricing"
            className="mt-5 block rounded-md bg-amber-500 px-4 py-3 text-center text-sm font-semibold text-white"
          >
            Buy credits
          </a>
        ) : (
          <button
            disabled={loading}
            className="mt-5 w-full rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        )}
      </aside>
    </form>
  );
}
