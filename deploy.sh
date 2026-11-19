#!/usr/bin/env bash
#
# 一键部署脚本（Ubuntu / Debian + Docker Compose v2）
#
#   ./deploy.sh              # 默认：只起 app，绑定 127.0.0.1:3000，由宿主机 Nginx 反代
#   ./deploy.sh --caddy      # Caddy 模式：容器接管 80/443 并自动申请证书
#   ./deploy.sh --no-build   # 跳过镜像构建，仅重启容器
#   ./deploy.sh --check      # 只做检查，不启动
#
# 脚本会在启动前逐项校验环境，任何一项失败都会给出具体修复命令并退出。

set -euo pipefail

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
MODE="nginx"
DO_BUILD=1
CHECK_ONLY=0

usage() {
  sed -n '2,10p' "$0" | sed 's/^# \{0,1\}//'
  exit 0
}

for arg in "$@"; do
  case "$arg" in
    --caddy) MODE="caddy" ;;
    --nginx) MODE="nginx" ;;
    --no-build) DO_BUILD=0 ;;
    --check) CHECK_ONLY=1 ;;
    -h|--help) usage ;;
    *) fail "未知参数：$arg（可用：--caddy / --nginx / --no-build / --check）" ;;
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
env_get() {
  local key="$1"
  grep -E "^[[:space:]]*${key}=" .env 2>/dev/null | tail -n 1 \
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
[ -f "data/kiasite.db" ] || fail "缺少 data/kiasite.db" \
'# 从已有环境拷贝（构建期要用它预渲染页面）：
scp kiasite.db user@server:'"$(pwd)"'/data/kiasite.db
# 或从备份恢复：
cp /path/to/kiasite-backup.db data/kiasite.db'

DB_SIZE=$(du -h "data/kiasite.db" | cut -f1)
ok "数据库 data/kiasite.db（$DB_SIZE）"

[ -d media ] || { mkdir -p media && warn "media/ 不存在，已创建空目录"; }
if [ -z "$(ls -A media 2>/dev/null)" ]; then
  warn "media/ 为空，站点上线后图片会是 404，记得把原 public/media 内容拷进来"
else
  ok "媒体目录 media/（$(find media -type f 2>/dev/null | wc -l | tr -d ' ') 个文件）"
fi

if [ ! -w data ] || [ ! -w media ]; then
  fail "data/ 或 media/ 当前用户不可写" \
'sudo chown -R 1001:1001 data media    # 容器内以 uid 1001 运行
sudo chmod -R 775 data media'
fi
ok "数据目录可写"

# ---------- 4. 模式相关 ----------
COMPOSE=(docker compose -f "$COMPOSE_FILE")

if [ "$MODE" = "caddy" ]; then
  DOMAIN=$(env_get SITE_DOMAIN)
  [ -n "$DOMAIN" ] || fail "--caddy 需要在 .env 设置 SITE_DOMAIN" \
'# 例：SITE_DOMAIN=blog.example.com
# 该项必须已经在 DNS 里解析到本机，否则证书签不下来
dig +short blog.example.com'
  ok "SITE_DOMAIN = $DOMAIN"

  if command -v ss >/dev/null 2>&1; then
    BUSY=$(ss -tlnp 2>/dev/null | grep -E ':(80|443)[[:space:]]' || true)
    if [ -n "$BUSY" ]; then
      warn "80/443 已被占用，Caddy 可能启动失败："
      printf '%s\n' "$BUSY" | sed 's/^/    /' >&2
      warn "如有宿主机 Web 服务器：sudo systemctl stop nginx && sudo systemctl disable nginx"
    else
      ok "80/443 空闲"
    fi
  fi

  COMPOSE+=(--profile caddy)
else
  if command -v ss >/dev/null 2>&1 && ss -tln 2>/dev/null | grep -qE ':3000[[:space:]]'; then
    warn "3000 端口已被占用，容器可能起不来（本机是否还开着 dev server？）"
  else
    ok "3000 端口空闲"
  fi
fi

# ---------- 5. 启动 ----------
if [ "$CHECK_ONLY" = "1" ]; then
  printf '\n%s检查通过，未执行启动（--check）%s\n\n' "$C_GREEN" "$C_RESET"
  exit 0
fi

UP_ARGS=(up -d)
if [ "$DO_BUILD" = "1" ]; then
  UP_ARGS+=(--build)
fi

printf '\n%s== 启动（模式：%s）==%s\n' "$C_BLUE" "$MODE" "$C_RESET"
info "${COMPOSE[*]} ${UP_ARGS[*]}"
"${COMPOSE[@]}" "${UP_ARGS[@]}" || fail "启动失败，查看日志：${COMPOSE[*]} logs --tail=100 app"

printf '\n%s== 状态 ==%s\n' "$C_BLUE" "$C_RESET"
"${COMPOSE[@]}" ps

printf '\n%s== 下一步 ==%s\n' "$C_BLUE" "$C_RESET"
if [ "$MODE" = "caddy" ]; then
  cat <<EOF
  查看证书签发：${COMPOSE[*]} logs --tail=60 -f caddy
  生效标志：日志出现 "certificate obtained successfully"
  访问地址：https://$DOMAIN
EOF
else
  cat <<'EOF'
  app 只监听 127.0.0.1:3000，还需要配置宿主机反向代理：
    sudo cp deploy/nginx.conf /etc/nginx/sites-available/kiasite.conf
    sudo ln -sf /etc/nginx/sites-available/kiasite.conf /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl reload nginx
  详见 deploy/nginx.conf 顶部注释。
EOF
fi
printf '  跟随日志：%s logs --tail=100 -f app\n\n' "${COMPOSE[*]}"
