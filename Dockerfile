FROM node:20.14-alpine AS app

WORKDIR /app

RUN apk add --no-cache libc6-compat openssl \
  && npm install -g pnpm@9.5.0

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --no-frozen-lockfile

COPY . .

RUN pnpm prisma generate
RUN pnpm run build

RUN mkdir -p /app/uploads && chown -R node:node /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

EXPOSE 3000

USER node

CMD ["sh", "-c", "pnpm prisma migrate deploy && pnpm start"]
