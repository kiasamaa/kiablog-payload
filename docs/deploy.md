# 部署到 Ubuntu 云服务器

单台服务器 + Docker + SQLite 的最小可用部署方案。反向代理有两种做法，二选一：

| | 宿主机 Nginx | Caddy（容器） |
|:--|:--|:--|
| 证书 | 自备（certbot 或云厂商签发） | 自动申请 + 自动续期 |
| 配置量 | 一个 server 块 | 20 行 Caddyfile |
| 上传体积 | 需手动放开，默认 1MB | 默认不限制 |
| 前置条件 | 无 | 必须独占 80/443 |
| 适合 | 机器上还跑着其他站点/服务 | 这台机器只服务本博客 |

脚本与配置都在仓库里：`deploy.sh`、`deploy/nginx.conf`、`deploy/Caddyfile`。

服务器目录约定（下文以 `/srv/kiasite` 为例）：

```txt
/srv/kiasite/
├── .env                  # 环境变量，不进 Git
├── data/kiasite.db       # SQLite，构建与运行共用
├── media/                # 上传的图片，挂到容器内 /app/public/media
├── deploy/Caddyfile
├── deploy/nginx.conf
└── （其余为仓库源码）
```

---

## 1. 服务器准备

```bash
sudo apt update && sudo apt upgrade -y

# Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER   # 重新登录后免 sudo

# 防火墙
sudo ufw allow OpenSSH
sudo ufw allow 80,443/tcp
sudo ufw allow 443/udp          # HTTP/3，仅 Caddy 需要
sudo ufw enable
```

云厂商控制台的**安全组**要单独放行 80/443，和 ufw 是两道独立的门。

---

## 2. 把数据传上去

仓库不含数据库和已上传的图片，必须手动搬：

```bash
# 本地执行（先停掉 dev server，避免拷到写了一半的库）
scp kiasite.db   user@server:/tmp/kiasite.db
scp -r public/media/. user@server:/tmp/media/     # 注意 media/. 是展开内容
```

```bash
# 服务器执行
sudo mkdir -p /srv/kiasite/data /srv/kiasite/media
sudo mv /tmp/kiasite.db /srv/kiasite/data/kiasite.db
sudo cp -r /tmp/media/. /srv/kiasite/media/
sudo rm -rf /tmp/media

# 容器内以 uid 1001 运行，需要能写这两个目录
sudo chown -R 1001:1001 /srv/kiasite/data /srv/kiasite/media
sudo chmod -R 775 /srv/kiasite/data /srv/kiasite/media
```

---

## 3. 拉代码与配置

```bash
cd /srv/kiasite
git clone <仓库地址> .
cp .env.example .env
```

`.env` 至少改这三项：

```dotenv
PAYLOAD_SECRET=<openssl rand -hex 32 的输出>
NEXT_PUBLIC_SERVER_URL=https://blog.example.com
SITE_DOMAIN=blog.example.com
```

- `NEXT_PUBLIC_SERVER_URL` 会**在构建期被内联进客户端产物**，改了必须重建镜像，`restart` 无效
- 结尾不要带 `/`，协议要与实际访问一致，否则后台登录态会反复掉
- 用 Caddy 或反代了其他子域时，再加 `EXTRA_DOMAIN=...`

### 数据库与媒体目录的位置

容器内的路径是固定的：

```
数据库    /app/data/kiasite.db
媒体文件  /app/public/media
```

宿主机上对应哪个目录，由两个变量决定（都可省略，默认值如下）：

```dotenv
DATA_DIR=./data              # 挂载到 /app/data
MEDIA_HOST_DIR=./media       # 挂载到 /app/public/media
```

> `.env` 里的 `DATABASE_URL` **只对本地 `pnpm dev` 有效**。容器里它被 compose 覆盖成 `file:/app/data/kiasite.db`，
> 想换存储位置要改 `DATA_DIR`，改 `DATABASE_URL` 是无效的。

---

## 4. 一键部署

```bash
chmod +x deploy.sh
./deploy.sh --check        # 只做检查，不启动
./deploy.sh                # Nginx 模式（默认）
./deploy.sh --caddy        # Caddy 模式，容器接管 80/443
./deploy.sh --no-build     # 跳过构建，仅重启
```

脚本会依次校验并在失败时给出修复命令：

| 检查项 | 失败时的行为 |
|:--|:--|
| 是否在仓库根目录（`Dockerfile` / compose 存在） | 退出 |
| Docker 与 Compose v2 是否可用、守护进程是否在跑 | 退出 |
| `.env` 是否存在 | 退出 |
| `PAYLOAD_SECRET` 非空、不是示例值、长度 ≥32 | 示例值退出，过短警告 |
| `NEXT_PUBLIC_SERVER_URL` 协议、结尾斜杠 | 缺失/格式错退出，非 https 警告 |
| `data/kiasite.db` 是否存在 | 退出（构建期要用它预渲染） |
| `media/` 是否为空、`data` 与 `media` 是否可写 | 空目录警告，不可写退出 |
| Caddy 模式：`SITE_DOMAIN` 是否配置、80/443 是否空闲 | 缺失退出，被占用警告 |
| Nginx 模式：3000 是否被占用 | 警告 |

检查通过后执行 `docker compose -f docker-compose.prod.yml up -d [--build]`，并打印状态与后续步骤。

> **构建期会读 `data/kiasite.db`**：Next 在构建时预渲染页面，Payload 必须有可用的数据库。缺文件时 Dockerfile 会直接报错退出。

手动执行的等价命令：

```bash
docker compose -f docker-compose.prod.yml up -d --build                    # Nginx 模式
docker compose -f docker-compose.prod.yml --profile caddy up -d --build    # Caddy 模式
```

---

## 5. 方式 A：宿主机 Nginx 反代

app 只绑定 `127.0.0.1:3000`，对外由 Nginx 承接。

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/kiasite.conf
sudo ln -sf /etc/nginx/sites-available/kiasite.conf /etc/nginx/sites-enabled/kiasite.conf
# 编辑该文件，替换 example.com 与证书路径
sudo nginx -t && sudo systemctl reload nginx
```

配置里已经处理好三件容易忘的事：

1. `client_max_body_size 64m`：后台上传大图不会 413
2. `/_next/static/` 与 `/api/media/file/` 长缓存
3. `proxy_buffering off`：后台实时预览（SSE）不被缓冲

证书两种来源都行：

```bash
sudo certbot --nginx -d example.com -d www.example.com    # Let's Encrypt
# 或者把 ssl_certificate / ssl_certificate_key 改成云厂商证书的路径
```

> 同一个端口只能有一个 `default_server`。如果机器上有多个 server 块，`nginx -t` 报 `duplicate default server` 时把本配置里的 `default_server` 去掉。

---

## 6. 方式 B：Caddy 自动 HTTPS

Caddy 必须独占 80/443，所以**机器上原有站点要一并交给它**。

### 切换前确认

```bash
# 域名解析到本机
dig +short blog.example.com

# 80/443 当前只有旧的 Web 服务器在监听
sudo ss -tlnp | grep -E ':80 |:443 '

# 如果旧服务器上有其他子域，它们的反代目标不能只绑回环地址
sudo ss -tlnp | grep <其他服务的端口>
```

第三项的含义：Caddy 跑在容器里，访问宿主机端口走 `host.docker.internal`（compose 已配 `extra_hosts`）。被反代的服务如果只监听 `127.0.0.1`，容器连不上，需要改成 `0.0.0.0`。

### 执行切换

```bash
# 备份原配置，方便回滚
sudo cp -r /etc/nginx /root/nginx-backup-$(date +%F)

sudo systemctl stop nginx
sudo systemctl disable nginx

cd /srv/kiasite
./deploy.sh --caddy

# 或手动：
# docker compose -f docker-compose.prod.yml --profile caddy up -d --build

docker compose -f docker-compose.prod.yml logs --tail=80 -f caddy
```

日志里出现 `certificate obtained successfully` 就说明签发成功。首次通常 10~30 秒；卡住超过 1 分钟多半是 80 端口不通，或域名走了 CDN 代理导致 HTTP-01 验证被拦（此时先关闭代理，签完再打开）。

### 同机其他子域

`deploy/Caddyfile` 末尾有注释示例：在 `.env` 加 `EXTRA_DOMAIN`，然后启用对应站点块。若那个服务暂时不能用 HTTPS，用 `http://{$EXTRA_DOMAIN}` 只监听 80、不申请证书。

### 回滚

```bash
cd /srv/kiasite
docker compose -f docker-compose.prod.yml --profile caddy down
sudo systemctl enable --now nginx
```

---

## 7. 上线后验证

```bash
curl -I https://blog.example.com
curl -s https://blog.example.com/api/albums | head -c 200

# Caddy 证书有效期
echo | openssl s_client -connect blog.example.com:443 2>/dev/null | openssl x509 -noout -dates
```

浏览器里依次确认：

1. 首页、文章列表、相册页能打开，图片正常显示
2. `/admin` 能用原账号登录（数据库是一起搬过去的）
3. 后台发一篇草稿并发布 → 前台能看到（说明按需重验证正常）
4. 后台上传一张图 → `ls -l /srv/kiasite/media | tail` 能看到新文件
5. 用手机流量访问一次，确认 DNS 与 HTTPS 都对

---

## 8. 日常更新

```bash
cd /srv/kiasite
git pull
./deploy.sh             # 重新构建并滚动重启
docker image prune -f
```

**改了集合字段**（schema 变化）：同样 `git pull` + `./deploy.sh` 即可。

`docker-compose.prod.yml` 里设了 `PAYLOAD_DB_PUSH=true`，容器启动时 Payload 会把表结构同步到线上库；`deploy.sh` 在启动前会自动把数据库备份到 `backups/`。

这个机制的边界要清楚：

| 变更类型 | 是否安全 |
|:--|:--|
| 新增字段、新增集合、加索引 | 安全，只做增量 |
| 删除字段、修改字段类型 | 底层可能重建表，历史数据有丢失风险 |
| 同时启动多个实例 | 不要，SQLite 写锁会让同步失败 |

涉及第二类改动时，先确认 `backups/` 里有可用备份再执行。

---

## 9. 备份

```bash
sudo tee /usr/local/bin/kiasite-backup >/dev/null <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
STAMP=$(date +%F-%H%M)
BACKUP=/srv/backup
mkdir -p "$BACKUP"

# SQLite 热备，不需要停服务
docker run --rm \
  -v /srv/kiasite/data:/data \
  -v "$BACKUP":/backup \
  alpine:3 sh -c "apk add --no-cache sqlite >/dev/null && sqlite3 /data/kiasite.db \".backup '/backup/db-$STAMP.db'\""

tar czf "$BACKUP/media-$STAMP.tar.gz" -C /srv/kiasite media
find "$BACKUP" -type f -mtime +14 -delete
EOF

sudo chmod +x /usr/local/bin/kiasite-backup
echo "20 4 * * * root /usr/local/bin/kiasite-backup" | sudo tee /etc/cron.d/kiasite-backup
```

---

## 10. 常见问题

| 现象 | 原因 / 处理 |
|:--|:--|
| 构建报 `缺少 data/kiasite.db` | 第 2 步没传数据库，或路径不对 |
| 容器启动即退出，日志 `EACCES` / `readonly database` | `data/`、`media/` 属主不是 1001：`sudo chown -R 1001:1001 ...` |
| Caddy 一直 `obtaining certificate` 后失败 | 80 端口被占 / DNS 未生效 / CDN 代理拦截验证 |
| `nginx -t` 报 `duplicate default server` | 多个 server 块都声明了 `default_server` |
| 后台上传图片 413 | 用 Nginx 且没放开 `client_max_body_size` |
| 图片 404 但 `media/` 有文件 | 容器内路径不对：确认 `MEDIA_DIR=/app/public/media` 且挂载为 `./media:/app/public/media` |
| 登录后立刻掉登录态 | `NEXT_PUBLIC_SERVER_URL` 与实际访问的域名/协议不一致 |
| 改了 `.env` 不生效 | `NEXT_PUBLIC_*` 是构建期内联的，必须 `--build` 重建 |
| `deploy.sh: /usr/bin/env: 'bash\r'` | 脚本被转成了 CRLF，仓库已用 `.gitattributes` 锁定 LF；本地可用 `git checkout -- deploy.sh` 重新拉取 |
| 启动日志报 `table ... already exists` 或列不匹配 | 数据库结构与代码 schema 冲突：确认 `PAYLOAD_DB_PUSH=true` 生效，且没有多个实例同时连接同一个库 |
| 改了字段重启后仍报列不存在 | 容器没重建（只 restart 了）：用 `./deploy.sh` 而不是 `docker compose restart` |

---

## 附：文件说明

| 文件 | 作用 |
|:--|:--|
| `deploy.sh` | 一键部署：环境校验 + 构建 + 启动，支持 `--caddy` / `--no-build` / `--check` |
| `Dockerfile` | 多阶段构建：装依赖 → 编译（用 `data/kiasite.db` 预渲染）→ 只带 standalone 产物 |
| `docker-compose.prod.yml` | 编排 app（+ 可选 caddy），挂载 `data`/`media`，带健康检查 |
| `deploy/nginx.conf` | 宿主机 Nginx 反代配置（方式 A） |
| `deploy/Caddyfile` | Caddy 自动 HTTPS 配置（方式 B） |
| `.dockerignore` | 把 `node_modules`、`.next`、`public/media`、`.env` 排除出构建上下文 |
