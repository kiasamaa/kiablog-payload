# syntax=docker/dockerfile:1
#
# 生产镜像：deps → builder → runner（Next standalone）
#
# 注意：构建阶段会预渲染页面，Payload 必须能连到数据库。
# 因此构建前请确保 data/kiasite.db 存在（直接从线上那份拷贝即可），
# 它只在构建期的临时副本里使用，不会被打进最终镜像。

FROM node:22-bookworm-slim AS base
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /app

# ---------- 依赖 ----------
FROM base AS deps
COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

# ---------- 构建 ----------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN test -f data/kiasite.db || (echo "✖ 缺少 data/kiasite.db：构建期要预渲染页面，需要一份可读的数据库副本" && exit 1)
# 用临时副本，避免构建产生的 -wal/-shm 影响原始文件
RUN cp data/kiasite.db /tmp/build.db
ENV DATABASE_URL=file:/tmp/build.db \
    PAYLOAD_SECRET=build-time-placeholder \
    NODE_ENV=production
ARG NEXT_PUBLIC_SERVER_URL=http://localhost:3000
ENV NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL
RUN pnpm build

# ---------- 运行 ----------
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# standalone 会把 .env 一并产出，镜像里不能留任何密钥（运行时用 compose 的环境变量）
RUN rm -f .env .env.local .env.production .env.development .env.test

# 数据卷挂载点：数据库与上传目录
RUN mkdir -p /app/data /app/public/media \
 && chown -R nextjs:nodejs /app/data /app/public/media

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
