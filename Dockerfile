# Stage 1: Dependency Installation
FROM node:22-alpine AS deps

WORKDIR /app

RUN apk add --no-cache libc6-compat openssl zlib

COPY package*.json ./
COPY prisma ./prisma/
# Install ALL dependencies (including devDeps for TS compilation)
RUN npm ci

# Stage 2: Build Application
FROM node:22-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client and compile TypeScript
RUN DATABASE_URL="postgresql://placeholder:5432" npx prisma generate
RUN npm run build

# Remove development dependencies and junk files
RUN npm prune --omit=dev
RUN wget -qO- https://gobinaries.com/tj/node-prune | sh && node-prune

# Stage 3: Production Environment
FROM node:22-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

EXPOSE 5000

CMD ["node", "dist/index.js"]