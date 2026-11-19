#!/usr/bin/env bash
#
# 一键部署脚本（Ubuntu / Debian + Docker Compose v2）
#
#   ./deploy.sh               # 构建并启动 app（默认监听 127.0.0.1:3000）
#   ./deploy.sh --no-build    # 跳过镜像构建，仅重启容器
#   ./deploy.sh --check       # 只做检查，不启动
#   ./deploy.sh --skip-backup # 跳过启动前的数据库备份
#
# 脚本只负责 Docker 部署。反向代理（Nginx 或 Caddy）的配置方式见 docs/deploy.md。
# 启动前会逐项校验环境，任何一项失败都会给出具体修复命令并退出。

set -euo pipefail

# 任何未被 || / if 接住的失败都打印行号，避免脚本"静默退出"
trap 'rc=$?; printf "\n✗ 脚本在第 %s 行意外中断（退出码 %s）\n" "$LINENO" "$rc" >&2; exit $rc' ERR

# ---------- 输出 ----------
if [ -t 1 ]; then
  C_RESET=$'\033[0m'; C_RED=$'\033[31m'; C_GREEN=$'\033[32m'
  C_YELLOW=$'\033[33m'; C_BLUE=$'\033[36m'; C_DIM=$'\033[2m'
else
  C_RESET=''; C_RED=''; C_GREEN=''; C_YELLOW=''; C_BLUE=''; C_DIM=''
fi

ok()   { printf '%s✓%s %s\n' "$C_GREEN" "$C_RESET" "$1"; }
warn() { printf '%s!%s %s\n' "$C_YELLOW" "$C_RESET" "$1" >&2; }
info() { printf '%s·%s %s\n' "$C_BLUE" "$C_RESET" "$1"; }
fail() {
  printf '%s✗ %s%s\n' "$C_RED" "$1" "$C_RESET" >&2
  if [ $# -gt 1 ]; then
    printf '  %s修复：%s\n' "$C_DIM" "$C_RESET" >&2
    while IFS= read -r line; do printf '    %s\n' "$line" >&2; done <<< "$2"
  fi
  exit 1
}

# ---------- 参数 ----------
DO_BUILD=1
CHECK_ONLY=0
SKIP_BACKUP=0

usage() {
  sed -n '2,11p' "$0" | sed 's/^# \{0,1\}//'
  exit 0
}

for arg in "$@"; do
  case "$arg" in
    --no-build) DO_BUILD=0 ;;
    --check) CHECK_ONLY=1 ;;
    --skip-backup) SKIP_BACKUP=1 ;;
    -h|--help) usage ;;
    --caddy|--nginx)
      fail "$arg 已移除：本脚本只部署 app，反代配置见 docs/deploy.md" \
'# Caddy 方式：
docker compose -f docker-compose.prod.yml --profile caddy up -d
# Nginx 方式：把站点反代到 127.0.0.1:3000（或 .env 里的 APP_PORT），模板见 deploy/nginx.conf'
      ;;
    *) fail "未知参数：$arg（可用：--no-build / --check / --skip-backup）" ;;
  esac
done

COMPOSE_FILE="docker-compose.prod.yml"
COMPOSE=()

# ---------- 0. 位置 ----------
cd "$(dirname "$0")" || fail "无法进入脚本所在目录"
[ -f "$COMPOSE_FILE" ] || fail "当前目录没有 $COMPOSE_FILE，请在仓库根目录执行"
[ -f "Dockerfile" ] || fail "当前目录没有 Dockerfile，请在仓库根目录执行"

printf '\n%s== 部署前检查 ==%s\n' "$C_BLUE" "$C_RESET"

# ---------- 1. Docker ----------
command -v docker >/dev/null 2>&1 || fail "未安装 Docker" \
'curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER   # 之后重新登录生效'

docker info >/dev/null 2>&1 || fail "Docker 守护进程不可用（未启动，或当前用户没有权限）" \
'sudo systemctl start docker
sudo usermod -aG docker $USER   # 重新登录后免 sudo'

docker compose version >/dev/null 2>&1 || fail "缺少 Docker Compose v2（docker compose 子命令）" \
'sudo apt install docker-compose-plugin'

ok "Docker $(docker version --format '{{.Server.Version}}' 2>/dev/null || echo '')"

# ---------- 2. .env ----------
[ -f .env ] || fail "缺少 .env" \
'cp .env.example .env
# 至少修改：PAYLOAD_SECRET、NEXT_PUBLIC_SERVER_URL'

# 只读取 KEY=VALUE，不 source，避免执行 .env 里的任意命令
# key 不存在时返回空串而不是非零（pipefail 下 grep 无匹配会让整个管道失败）
env_get() {
  local key="$1"
  { grep -E "^[[:space:]]*${key}=" .env 2>/dev/null || true; } | tail -n 1 \
    | cut -d= -f2- | sed -e 's/^["'\'']//' -e 's/["'\'']$//' -e 's/[[:space:]]*$//'
}

SECRET=$(env_get PAYLOAD_SECRET)
[ -n "$SECRET" ] || fail ".env 缺少 PAYLOAD_SECRET" \
'openssl rand -hex 32    # 把输出填到 .env 的 PAYLOAD_SECRET'
[ "$SECRET" != "YOUR_SECRET_HERE" ] || fail "PAYLOAD_SECRET 还是示例值" \
'openssl rand -hex 32    # 替换 .env 里的 PAYLOAD_SECRET'
[ ${#SECRET} -ge 32 ] || warn "PAYLOAD_SECRET 长度不足 32，建议重新生成：openssl rand -hex 32"
ok "PAYLOAD_SECRET 已配置"

SERVER_URL=$(env_get NEXT_PUBLIC_SERVER_URL)
[ -n "$SERVER_URL" ] || fail ".env 缺少 NEXT_PUBLIC_SERVER_URL" \
'# 例：NEXT_PUBLIC_SERVER_URL=https://blog.example.com'
case "$SERVER_URL" in
  https://*) : ;;
  http://localhost*) warn "NEXT_PUBLIC_SERVER_URL 还是本地地址，线上登录态和 SEO 会出问题" ;;
  http://*) warn "NEXT_PUBLIC_SERVER_URL 不是 https，生产环境建议启用 HTTPS" ;;
  *) fail "NEXT_PUBLIC_SERVER_URL 必须以 http(s):// 开头（当前：$SERVER_URL）" ;;
esac
case "$SERVER_URL" in
  */) fail "NEXT_PUBLIC_SERVER_URL 结尾不要带 /（当前：$SERVER_URL）" ;;
esac
ok "NEXT_PUBLIC_SERVER_URL = $SERVER_URL"

# ---------- 3. 数据 ----------
# 宿主机目录由 .env 的 DATA_DIR / MEDIA_HOST_DIR 决定，与 compose 的挂载保持一致
DATA_DIR=$(env_get DATA_DIR); DATA_DIR=${DATA_DIR:-data}
MEDIA_HOST_DIR=$(env_get MEDIA_HOST_DIR); MEDIA_HOST_DIR=${MEDIA_HOST_DIR:-media}

abs_path() {
  case "$1" in
    ''|'.') printf '%s' "$(pwd)" ;;
    /*)     printf '%s' "$1" ;;
    *)      printf '%s/%s' "$(pwd)" "${1#./}" ;;
  esac
}

DATA_ABS=$(abs_path "$DATA_DIR")
MEDIA_ABS=$(abs_path "$MEDIA_HOST_DIR")
DB_FILE="$DATA_ABS/kiasite.db"

# DATA_DIR=. 会把整个仓库挂进容器的 /app/data，虽然能跑但不安全
if [ "$DATA_ABS" = "$(pwd)" ]; then
  warn "DATA_DIR 指向项目根，整个仓库会被挂载到容器 /app/data"
  warn "  建议改用专用目录：mkdir -p data && mv kiasite.db data/，然后删掉 .env 里的 DATA_DIR"
fi

# DATABASE_URL 只对本地开发生效，容器内被 compose 固定为 /app/data/kiasite.db
DB_URL=$(env_get DATABASE_URL)
case "$DB_URL" in
  ''|'file:./kiasite.db'|'file:./data/kiasite.db'|'file:/app/data/kiasite.db') : ;;
  *)
    warn "DATABASE_URL=$DB_URL 只对本地 pnpm dev 有效，容器内固定为 file:/app/data/kiasite.db"
    warn "要改存放位置请设置 .env 的 DATA_DIR（当前：$DATA_DIR）"
    ;;
esac

[ -f "$DB_FILE" ] || fail "缺少数据库文件：$DB_FILE" \
"# 从已有环境拷贝（构建期要用它预渲染页面）：
scp kiasite.db user@server:$DATA_ABS/kiasite.db
# 或从备份恢复：
cp /path/to/kiasite-backup.db $DB_FILE
# 如果数据库不在这里，检查 .env 的 DATA_DIR（当前：$DATA_DIR）"

DB_SIZE=$(du -h "$DB_FILE" | cut -f1)
ok "数据库 $DATA_DIR/kiasite.db（$DB_SIZE）"

if [ ! -d "$MEDIA_ABS" ]; then
  mkdir -p "$MEDIA_ABS" || fail "无法创建媒体目录：$MEDIA_ABS" \
"sudo mkdir -p $MEDIA_ABS && sudo chown 1001:1001 $MEDIA_ABS"
  warn "媒体目录 $MEDIA_HOST_DIR 不存在，已创建空目录"
fi
if [ -z "$(ls -A "$MEDIA_ABS" 2>/dev/null)" ]; then
  warn "$MEDIA_HOST_DIR 为空，站点上线后图片会是 404，记得把原 public/media 内容拷进来"
else
  ok "媒体目录 $MEDIA_HOST_DIR（$(find "$MEDIA_ABS" -type f 2>/dev/null | wc -l | tr -d ' ') 个文件）"
fi

# 容器内以 uid 1001 运行，属主不对会导致建表失败或上传 500
check_owner() {
  local dir="$1" label="$2" uid
  uid=$(stat -c '%u' "$dir" 2>/dev/null || echo '?')
  case "$uid" in
    1001|0) ok "$label 属主正确（uid=$uid）" ;;
    *)
      warn "$label 属主是 uid=$uid，容器内以 1001 运行，可能无法写入"
      warn "  sudo chown -R 1001:1001 $dir"
      ;;
  esac
}

check_owner "$DATA_ABS" "$DATA_DIR"
check_owner "$MEDIA_ABS" "$MEDIA_HOST_DIR"

# ---------- 4. 组装命令 ----------
COMPOSE=(docker compose -f "$COMPOSE_FILE")

# 宿主机监听端口（容器内始终是 3000）
APP_PORT=$(env_get APP_PORT); APP_PORT=${APP_PORT:-3000}

# 只启动 app。compose 里 Caddy 属于 caddy profile，不指定时不会拉起，
# 需要它时按 docs/deploy.md 手动启动。
if command -v ss >/dev/null 2>&1; then
  if ss -tln 2>/dev/null | grep -qE ":${APP_PORT}[[:space:]]"; then
    warn "宿主机端口 $APP_PORT 已被占用，容器起不来（port is already allocated）"
    ss -tlnp 2>/dev/null | grep -E ":${APP_PORT}[[:space:]]" | sed 's/^/    /' >&2 || true
    warn "二选一：停掉占用该端口的服务，或在 .env 里设置 APP_PORT=<空闲端口>"
  else
    ok "端口 $APP_PORT 空闲"
  fi
fi

if [ "$CHECK_ONLY" = "1" ]; then
  printf '\n%s检查通过，未执行启动（--check）%s\n\n' "$C_GREEN" "$C_RESET"
  exit 0
fi

# ---------- 5. 启动前备份 ----------
# 生产开着 PAYLOAD_DB_PUSH，改字段时表结构会被自动调整，先留一份可回滚的库
if [ "$SKIP_BACKUP" = "1" ]; then
  warn "已跳过数据库备份（--skip-backup）"
else
  STAMP=$(date +%F-%H%M)
  BACKUP_DIR=$(abs_path "backups")
  mkdir -p "$BACKUP_DIR"
  if docker run --rm \
      -v "$DATA_ABS:/data" \
      -v "$BACKUP_DIR:/backup" \
      alpine:3 \
      sh -c "apk add --no-cache sqlite >/dev/null 2>&1 && sqlite3 /data/kiasite.db \".backup '/backup/kiasite-$STAMP.db'\"" >/dev/null 2>&1; then
    ok "数据库已备份 → backups/kiasite-$STAMP.db"
  else
    cp "$DB_FILE" "$BACKUP_DIR/kiasite-$STAMP.db"
    warn "sqlite3 备份失败，已退回文件复制（容器已停止时这样是安全的；运行中则可能拷到写了一半的库）"
  fi
  # 只保留最近 10 份，避免磁盘被占满（没有旧文件时 ls 返回非零，不能让 set -e 中断）
  { ls -1t "$BACKUP_DIR"/kiasite-*.db 2>/dev/null || true; } | tail -n +11 | while IFS= read -r old; do
    rm -f "$old"
  done
fi

# ---------- 6. 启动 ----------
UP_ARGS=(up -d)
if [ "$DO_BUILD" = "1" ]; then
  UP_ARGS+=(--build)
fi

printf '\n%s== 启动 ==%s\n' "$C_BLUE" "$C_RESET"
info "${COMPOSE[*]} ${UP_ARGS[*]}"
"${COMPOSE[@]}" "${UP_ARGS[@]}" || fail "启动失败，查看日志：${COMPOSE[*]} logs --tail=100 app"

printf '\n%s== 状态 ==%s\n' "$C_BLUE" "$C_RESET"
"${COMPOSE[@]}" ps

printf '\n%s== 下一步 ==%s\n' "$C_BLUE" "$C_RESET"
cat <<EOF
  app 已启动，只监听 127.0.0.1:$APP_PORT，还需要配置反向代理（二选一，详见 docs/deploy.md）：
    Nginx：把站点反代到 127.0.0.1:$APP_PORT，配置模板见 deploy/nginx.conf
    Caddy：docker compose -f docker-compose.prod.yml --profile caddy up -d
EOF
printf '  跟随日志：%s logs --tail=100 -f app\n\n' "${COMPOSE[*]}"
