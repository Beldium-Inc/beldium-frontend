FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json ./

RUN corepack enable && corepack prepare pnpm@latest --activate && \
    pnpm install
COPY . .

RUN pnpm build  

FROM node:22-alpine 

RUN addgroup -S appgroup && adduser -S appuser -G appgroup && \
    apk add --no-cache wget

WORKDIR /app

COPY --from=builder --chown=appuser:appgroup /app/.next/standalone ./
COPY --from=builder --chown=appuser:appgroup /app/.next/static ./.next/static
COPY --from=builder --chown=appuser:appgroup /app/public ./public

USER appuser

ENV HOSTNAME="0.0.0.0"
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/ || exit 1

CMD ["node", "--trace_gc", "server.js"]