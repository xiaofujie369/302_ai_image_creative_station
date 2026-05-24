# AI Image Creative Station SaaS

Production-ready AI image generation SaaS based on 302 AI Image Creative Station. It keeps the original localized creative tools and adds account login, server-side OpenAI image generation, credits, Stripe Checkout, generation history, local/S3 storage, and an admin console.

## Features

- Text-to-image, image edit, image variation, and style workflows.
- Default image model is configurable and seeded as `gpt-image-2`.
- Supported model options: `gpt-image-2`, `gpt-image-1.5`, `gpt-image-1-mini`.
- OpenAI API key is used only from server routes.
- NextAuth login with Google and email.
- PostgreSQL + Prisma data model for users, logs, credits, orders, plans, settings, and audit logs.
- Credit checks before generation; credits are deducted only after successful OpenAI output storage.
- Stripe Checkout with signed webhook verification and idempotent credit delivery.
- Local `/uploads` storage by default, with S3-compatible storage available through env vars.
- Redis-backed rate limiting with in-memory fallback.
- Admin console at `/admin`.

## Local Development

1. Install dependencies:

```bash
corepack enable
pnpm install
```

2. Copy environment file:

```bash
cp .env.example .env
```

3. Start PostgreSQL and Redis locally or with Docker:

```bash
docker compose up -d postgres redis
```

4. Initialize Prisma:

```bash
pnpm prisma generate
pnpm prisma migrate deploy
pnpm prisma db seed
```

5. Start the app:

```bash
pnpm dev
```

The app listens on [http://localhost:3000](http://localhost:3000).

## Docker Deployment

```bash
cp .env.example .env
docker compose up -d --build
docker compose exec app pnpm prisma db seed
```

The `app` service listens on port `3000`. Uploads are persisted in the `uploads_data` Docker volume.

## Environment Variables

`DATABASE_URL`: PostgreSQL connection string.

`NEXTAUTH_URL`: Public application URL used by NextAuth.

`NEXTAUTH_SECRET`: Random secret for NextAuth sessions.

`OPENAI_API_KEY`: Server-side OpenAI API key.

`OPENAI_IMAGE_DEFAULT_MODEL`: Default image model, normally `gpt-image-2`.

`OPENAI_IMAGE_FALLBACK_MODEL`: Reserved fallback or low-cost model, normally `gpt-image-1-mini`.

`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: Google OAuth credentials.

`EMAIL_SERVER`, `EMAIL_FROM`: Optional NextAuth email provider SMTP settings.

`STRIPE_SECRET_KEY`: Stripe secret key.

`STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret.

`STRIPE_PUBLIC_KEY`: Public Stripe key, reserved for future client integrations.

`ADMIN_EMAILS`: Comma-separated admin emails. The first registered user is also promoted to admin.

`REDIS_URL`: Redis URL for rate limiting.

`APP_NAME`: Public site name.

`APP_URL`: Public app URL used by checkout redirects.

`SIGNUP_BONUS_CREDITS`: Credits granted to new users.

`LOCAL_UPLOAD_DIR`: Local upload directory. Default: `./uploads`.

`PUBLIC_UPLOAD_BASE_URL`: Public base URL for local uploads. Default: `/uploads`.

`S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL`: S3-compatible object storage configuration. Leave empty to use local storage.

`RATE_LIMIT_GENERATION_PER_MINUTE`: Per-user generation limit.

`RATE_LIMIT_IP_PER_MINUTE`: Per-IP generation limit.

`ALLOW_LEGACY_CLIENT_API`: Defaults to `false`. Keep it disabled for the paid SaaS because legacy 302 endpoints accept client-supplied keys and bypass SaaS credits.

The `NEXT_PUBLIC_302_*` variables are retained for the original 302 localized pages.

## Admin Access

1. Set `ADMIN_EMAILS=you@example.com`.
2. Sign in at `/login` with that email or Google account.
3. Open `/admin`.

Admins can view dashboard metrics, manage users, adjust credits, inspect generation logs, delete unsafe generation records, manage orders and plans, edit system settings, and view audit logs.

## Stripe Setup

1. Create a Stripe secret key and set `STRIPE_SECRET_KEY`.
2. Add a webhook endpoint:

```text
https://your-domain.com/api/stripe/webhook
```

3. Subscribe to:

```text
checkout.session.completed
checkout.session.expired
```

4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`.

When checkout completes, the webhook updates the order to `paid` and creates a `purchase` credit transaction. Replayed webhook events do not add credits twice.

## OpenAI Image Model Configuration

Set the default through environment:

```env
OPENAI_IMAGE_DEFAULT_MODEL=gpt-image-2
OPENAI_IMAGE_FALLBACK_MODEL=gpt-image-1-mini
```

Admins can also change `openai.image.default_model` and `openai.image.fallback_model` at `/admin/settings`. The public generation page never receives the OpenAI API key.

## Credit Rules

Seeded defaults:

- Text-to-image: `1` credit.
- Image edit: `3` credits.
- Variation: `3` credits.
- HD quality: additional `3` credits.
- `gpt-image-2` multiplier: `2`.

All rules live in `system_settings` and are editable from `/admin/settings`.

## Caddy Reverse Proxy

```caddyfile
img.example.com {
    encode gzip
    reverse_proxy 127.0.0.1:3000
}
```

## Troubleshooting

- If login redirects fail, check `NEXTAUTH_URL` and `NEXTAUTH_SECRET`.
- If plans are empty, run `pnpm prisma db seed`.
- If generation returns `Insufficient credits`, add credits from `/admin/users`.
- If uploads do not load, check `LOCAL_UPLOAD_DIR` and `PUBLIC_UPLOAD_BASE_URL`.
- If webhooks do not add credits, verify `STRIPE_WEBHOOK_SECRET` and that the event is `checkout.session.completed`.
- If Docker build fails after dependency changes, rebuild with `docker compose build --no-cache app`.
