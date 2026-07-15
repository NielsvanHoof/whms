# syntax=docker/dockerfile:1
#
# Production Next.js image using `output: "standalone"` (see next.config.ts).
#
# Build from monorepo root:
#   docker buildx build -f web/Dockerfile --build-arg NEXT_PUBLIC_API_URL=https://api.example.com/ -t warehouse-web:local web
#
# Runtime: set NEXT_PUBLIC_API_URL at *build* time if the client must embed a fixed API origin.

FROM node:22-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Bake public API URL for client bundles when provided (empty string is valid for same-origin).
ARG NEXT_PUBLIC_API_URL=
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN groupadd --system --gid 1001 nodejs \
	&& useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
