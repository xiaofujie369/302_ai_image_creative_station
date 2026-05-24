CREATE TYPE "UserRole" AS ENUM ('user', 'admin');
CREATE TYPE "UserStatus" AS ENUM ('active', 'banned');
CREATE TYPE "GenerationMode" AS ENUM ('text_to_image', 'image_edit', 'variation', 'style');
CREATE TYPE "GenerationStatus" AS ENUM ('pending', 'success', 'failed');
CREATE TYPE "CreditTransactionType" AS ENUM ('purchase', 'generation', 'refund', 'admin_adjustment', 'signup_bonus');
CREATE TYPE "OrderProvider" AS ENUM ('stripe', 'manual');
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'paid', 'failed', 'refunded');

CREATE TABLE "users" (
  "id" TEXT NOT NULL,
  "email" TEXT,
  "email_verified" TIMESTAMP(3),
  "name" TEXT,
  "avatar" TEXT,
  "role" "UserRole" NOT NULL DEFAULT 'user',
  "credits" INTEGER NOT NULL DEFAULT 0,
  "status" "UserStatus" NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "accounts" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "provider_account_id" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sessions" (
  "id" TEXT NOT NULL,
  "session_token" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "verification_tokens" (
  "identifier" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "generation_logs" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "request_id" TEXT,
  "prompt" TEXT NOT NULL,
  "negative_prompt" TEXT,
  "mode" "GenerationMode" NOT NULL,
  "model" TEXT NOT NULL,
  "size" TEXT,
  "quality" TEXT,
  "input_image_url" TEXT,
  "output_image_url" TEXT,
  "cost_credits" INTEGER NOT NULL DEFAULT 0,
  "status" "GenerationStatus" NOT NULL DEFAULT 'pending',
  "error_message" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "generation_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "orders" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "provider" "OrderProvider" NOT NULL,
  "provider_order_id" TEXT,
  "amount" DECIMAL(10,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "credits" INTEGER NOT NULL,
  "status" "OrderStatus" NOT NULL DEFAULT 'pending',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "paid_at" TIMESTAMP(3),
  CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "credit_transactions" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "type" "CreditTransactionType" NOT NULL,
  "amount" INTEGER NOT NULL,
  "balance_after" INTEGER NOT NULL,
  "description" TEXT,
  "related_order_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "credit_transactions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "plans" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "price" DECIMAL(10,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "credits" INTEGER NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "system_settings" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "description" TEXT,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "admin_audit_logs" (
  "id" TEXT NOT NULL,
  "admin_user_id" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "target_type" TEXT NOT NULL,
  "target_id" TEXT,
  "detail" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");
CREATE INDEX "accounts_user_id_idx" ON "accounts"("user_id");
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");
CREATE UNIQUE INDEX "generation_logs_request_id_key" ON "generation_logs"("request_id");
CREATE INDEX "generation_logs_user_id_created_at_idx" ON "generation_logs"("user_id", "created_at");
CREATE INDEX "generation_logs_model_idx" ON "generation_logs"("model");
CREATE INDEX "generation_logs_status_idx" ON "generation_logs"("status");
CREATE UNIQUE INDEX "orders_provider_order_id_key" ON "orders"("provider_order_id");
CREATE INDEX "orders_user_id_created_at_idx" ON "orders"("user_id", "created_at");
CREATE INDEX "orders_status_idx" ON "orders"("status");
CREATE INDEX "credit_transactions_user_id_created_at_idx" ON "credit_transactions"("user_id", "created_at");
CREATE INDEX "credit_transactions_related_order_id_idx" ON "credit_transactions"("related_order_id");
CREATE INDEX "plans_is_active_sort_order_idx" ON "plans"("is_active", "sort_order");
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");
CREATE INDEX "admin_audit_logs_admin_user_id_created_at_idx" ON "admin_audit_logs"("admin_user_id", "created_at");
CREATE INDEX "admin_audit_logs_target_type_target_id_idx" ON "admin_audit_logs"("target_type", "target_id");

ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "generation_logs" ADD CONSTRAINT "generation_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_related_order_id_fkey" FOREIGN KEY ("related_order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
