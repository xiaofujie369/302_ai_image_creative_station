import { prisma } from "@/lib/prisma";

export const DEFAULT_SETTINGS = {
  "openai.image.default_model": "gpt-image-2",
  "openai.image.fallback_model": "gpt-image-1-mini",
  "credits.text_to_image": "1",
  "credits.image_edit": "3",
  "credits.variation": "3",
  "credits.hd": "3",
  "credits.gpt_image_2_multiplier": "2",
  "signup.bonus_credits": "10",
  "auth.registration_enabled": "true",
  "auth.google_enabled": "true",
  "auth.email_enabled": "true",
  "site.name": "AI Image Creative Station",
  "site.logo": "/images/global/logo-light.png",
  "site.maintenance_mode": "false",
  "security.prompt_max_length": "2000",
  "security.upload_max_mb": "10",
};

export type SettingKey = keyof typeof DEFAULT_SETTINGS;

export async function getSetting(key: SettingKey | string) {
  const setting = await prisma.systemSetting.findUnique({ where: { key } });
  return setting?.value ?? DEFAULT_SETTINGS[key as SettingKey] ?? "";
}

export async function getSettingsMap() {
  const rows = await prisma.systemSetting.findMany();
  const map = new Map<string, string>(
    Object.entries(DEFAULT_SETTINGS)
  );
  for (const row of rows) {
    map.set(row.key, row.value);
  }
  return map;
}

export function asBoolean(value: string | undefined, fallback = false) {
  if (value === undefined || value === "") return fallback;
  return value === "true" || value === "1" || value === "yes";
}

export function asNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
