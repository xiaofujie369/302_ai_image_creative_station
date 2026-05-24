import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const settings = [
  ["openai.image.default_model", process.env.OPENAI_IMAGE_DEFAULT_MODEL || "gpt-image-2", "Default image generation model"],
  ["openai.image.fallback_model", process.env.OPENAI_IMAGE_FALLBACK_MODEL || "gpt-image-1-mini", "Fallback image generation model"],
  ["credits.text_to_image", "1", "Credits for normal text-to-image generation"],
  ["credits.image_edit", "3", "Credits for image editing"],
  ["credits.variation", "3", "Credits for image variation"],
  ["credits.hd", "3", "Credits for high quality generation"],
  ["credits.gpt_image_2_multiplier", "2", "Cost multiplier for gpt-image-2"],
  ["signup.bonus_credits", process.env.SIGNUP_BONUS_CREDITS || "10", "Credits granted to new users"],
  ["auth.registration_enabled", "true", "Allow new user registration"],
  ["auth.google_enabled", "true", "Allow Google login"],
  ["auth.email_enabled", "true", "Allow email login"],
  ["site.name", process.env.APP_NAME || "AI Image Creative Station", "Public website name"],
  ["site.logo", "/images/global/logo-light.png", "Public website logo"],
  ["site.maintenance_mode", "false", "Maintenance mode"],
  ["security.prompt_max_length", "2000", "Maximum prompt length"],
  ["security.upload_max_mb", "10", "Maximum upload size in MB"],
];

async function main() {
  const plans = [
    { name: "Starter", price: "2.99", currency: "USD", credits: 50, sortOrder: 1 },
    { name: "Creator", price: "6.99", currency: "USD", credits: 150, sortOrder: 2 },
    { name: "Studio", price: "19.99", currency: "USD", credits: 500, sortOrder: 3 },
  ];

  for (const plan of plans) {
    const exists = await prisma.plan.findFirst({ where: { name: plan.name } });
    if (!exists) await prisma.plan.create({ data: plan });
  }

  for (const [key, value, description] of settings) {
    await prisma.systemSetting.upsert({
      where: { key },
      update: {},
      create: { key, value, description },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
