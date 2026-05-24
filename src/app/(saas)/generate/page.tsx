import GenerateClient from "@/components/saas/generate-client";
import { asNumber, getSettingsMap } from "@/lib/settings";
import { requirePageUser } from "@/lib/server-auth";

export default async function GeneratePage() {
  const [user, settings] = await Promise.all([requirePageUser(), getSettingsMap()]);
  const defaultModel =
    process.env.OPENAI_IMAGE_DEFAULT_MODEL ||
    settings.get("openai.image.default_model") ||
    "gpt-image-2";

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-semibold">Generate images</h1>
          <p className="mt-2 text-slate-600">
            OpenAI calls run on the server. Credits are charged only after success.
          </p>
        </div>
        <div className="rounded-md border bg-white px-4 py-3 text-sm font-medium">
          Balance: {user.credits} credits
        </div>
      </div>
      <GenerateClient
        credits={user.credits}
        defaultModel={defaultModel}
        costs={{
          text: asNumber(settings.get("credits.text_to_image"), 1),
          edit: asNumber(settings.get("credits.image_edit"), 3),
          variation: asNumber(settings.get("credits.variation"), 3),
          hd: asNumber(settings.get("credits.hd"), 3),
          gptImage2Multiplier: asNumber(settings.get("credits.gpt_image_2_multiplier"), 1),
        }}
      />
    </main>
  );
}
