FROM node:25-slim AS deps

WORKDIR /app

RUN apt-get update && apt-get install -y curl openssl libssl-dev && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

FROM node:25-slim AS builder

WORKDIR /app

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npm run build

RUN node -e "const { pipeline } = require('@huggingface/transformers'); \
    pipeline('feature-extraction', 'Xenova/clip-vit-base-patch16')"

RUN npm prune --omit=dev
RUN curl -sfL https://gobinaries.com/tj/node-prune | sh && ./bin/node-prune

FROM node:25-slim AS runner
WORKDIR /app

RUN apt-get update && apt-get install -y openssl libgomp1 && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV TRANSFORMERS_CACHE=/app/.cache

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
RUN chown -R nodejs:nodejs /app/.cache
RUN mkdir -p /app/.cache && chown -R nodejs:nodejs /app

USER nodejs

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/certs ./certs
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /root/.cache/huggingface /app/.cache/huggingface

EXPOSE 5000

CMD ["node", "dist/index.js"]