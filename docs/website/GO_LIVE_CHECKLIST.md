# Website Phase 1 Go-Live Checklist (meaningful.ink / www.meaningful.ink)

> Note: Yu currently deploys the website via Baota + prebuilt standalone copy mode. Prefer `docs/website/DEPLOY_WINDOWS_BAOTA.md` for the active, low-memory-server process; the server does not run npm install/build.
> The remaining Gitee + source-build + NSSM sections below are kept as a legacy alternative only.

> **端口与流程不可混用：当前预构建 standalone + 宝塔流程使用 `127.0.0.1:3001`；本文件下方的旧源码构建 + NSSM 流程使用 `127.0.0.1:3000`。选择旧流程时，启动命令、健康检查和全部 Nginx `proxy_pass` 必须保持 3000；不要复制当前宝塔流程的 3001 配置，反之亦然。**

目标：把 `apps/website/` 以 **Windows Server 2022 + Nginx + NSSM** 方式上线，并支持：
- `https://meaningful.ink/`
- `https://www.meaningful.ink/`

约束：
- 不要把任何密钥提交到 git。
- `WEATHERAPI_KEY` 只允许存在于服务器进程环境中，禁止使用 `NEXT_PUBLIC_` 前缀。
- Next.js 仅本机监听（建议 `127.0.0.1:3000`），公网只暴露 80/443（Nginx）。

---

## 0) P0 需要先确认（上线前必须明确）
以下信息如果不明确，会直接阻塞上线或导致回滚不可用：

- **域名策略**：`meaningful.ink` / `www.meaningful.ink` 谁做主站？另一方是否 301 跳转？
- **证书**：Nginx 上这两个域名的 TLS 证书如何获取/续期（Let's Encrypt / 手动证书 / 其它）？
- **Windows SSH**：Windows 是否已开启 OpenSSH Server（sshd），并允许 CI Runner 访问（公网入站）？
- **服务名**：NSSM 服务名（建议固定为 `meaningful-website`，部署/回滚脚本都依赖）
- **端口**：Next.js 监听端口（默认 3000，建议固定；以及只监听 127.0.0.1）
- **目录约定**（建议一次性定死，减少脚本分歧）：
  - Incoming：`C:\incoming`（scp 上传 zip 的落点；Secrets 里建议写 `C:/incoming`）
  - Releases：`C:\services\website\releases\<BuildId>`
  - Contact data：`C:\services\website\data\contact`（必须独立于 Releases，避免版本轮换丢失提交）
  - Logs：`C:\logs\website`
  - Deploy script：`C:\deploy\website-deploy.ps1`
- **联系表单持久化**：生产环境必须设置 `CONTACT_SUBMISSIONS_DIR=C:\services\website\data\contact`，并确认 NSSM 服务账号可写。
- **联系表单通知**：配置 `CONTACT_NOTIFICATION_WEBHOOK_URL`；如果暂不配置，必须明确由谁、以什么频率检查 JSONL 提交文件。
- **天气服务**：查询功能上线前注册 WeatherAPI.com Free key。Free 方案为每月 100,000 次调用，current 缓存最多 60 分钟、forecast 缓存最多 24 小时，并要求 attribution/免责声明。

---

## 1) Gitee CI/CD Secrets（website-cd-prod 需要）
对应 `gitee/website/.gitee/workflows/website-cd.yml`。

在 Gitee 仓库 Settings → Secrets 中设置：

- `DEPLOY_HOST`：Windows Server 公网 IP / 域名
- `DEPLOY_PORT`：SSH 端口（例如 `22`）
- `DEPLOY_USER`：Windows SSH 登录用户名
- `DEPLOY_SSH_KEY`：用于 ssh/scp 的私钥（建议 PEM 原文；如果复制会混入 CRLF，需要确保不带 `\r`）
- `DEPLOY_INCOMING_DIR`：Windows 上 incoming 目录（建议用正斜杠写法，便于 scp：例如 `C:/incoming`；PowerShell 也能识别）
- `DEPLOY_PS1`：Windows 上部署脚本的完整路径（例如 `C:\deploy\website-deploy.ps1`）

建议：为部署创建一个专用用户，最小化权限（仅部署目录读写 + 能重启服务）。

---

## 2) Windows Server 一次性准备
管理员 PowerShell：

```powershell
# 目录约定（按需调整，但建议固定）
mkdir C:\incoming
mkdir C:\services\website\releases
mkdir C:\services\website\data\contact
mkdir C:\logs\website
mkdir C:\deploy
```

依赖：
- Node.js 22.22.0（与仓库 `engines.node`、GitHub/Gitee CI 保持一致）
- OpenSSH Server（sshd）
- Nginx for Windows（例如 `C:\nginx\nginx.exe`）
- NSSM（例如 `C:\tools\nssm\nssm.exe`）

验证：
```powershell
node -v
npm -v
```

---

## 3) 部署脚本（Windows，`DEPLOY_PS1` 指向）
`website-cd-prod` 最后一步会远程执行 PowerShell 脚本，并传入：
- `-BuildId <sha-or-manual>`
- `-ZipPath <incoming/website-src-<BuildId>.zip>`

仓库内提供一个可用的模板脚本：`docs/website/website-deploy.ps1`。
首次上线建议把它放到服务器：`C:\\deploy\\website-deploy.ps1`（手工复制文件，或用 scp 上传）。

然后把 Gitee Secret `DEPLOY_PS1` 指向 `C:\\deploy\\website-deploy.ps1`。

建议脚本最小行为：
1) 校验 zip 存在。
2) 解压到 `C:\services\website\releases\<BuildId>`。
3) 在解压目录执行：
   - `npm ci`
   - `npm -w apps/website run build`
4) 重启 NSSM 服务。
5) 追加一条部署日志到 `C:\logs\website`（可选，但强烈建议）。

注意：如果需要环境变量，优先用系统或服务环境变量；不要把真实值写入 `.env*` 或发布包。`apps/website/.env.example` 只登记空的 `WEATHERAPI_KEY=` 名称和 server-only 边界，不要把真实 key 填进该受 Git 跟踪的模板。

---

## 4) NSSM 服务（常驻 + 自动重启 + 日志）
建议服务名：`meaningful-website`。

安装（GUI）：
```powershell
C:\tools\nssm\nssm.exe install meaningful-website
```

GUI 参数建议：
- Path：`C:\Program Files\nodejs\npm.cmd`
- Startup directory：`C:\services\website\releases\<BuildId>`（首次可先手工选一个 buildId 目录）
- Arguments：
  - `run start -w apps/website -- -p 3000 -H 127.0.0.1`

I/O（建议）：
- stdout：`C:\logs\website\stdout.log`
- stderr：`C:\logs\website\stderr.log`

环境变量（必须在服务端或 NSSM 服务环境中配置，不要写入仓库）：
- `NEXT_PUBLIC_SITE_URL=https://www.meaningful.ink`
- `CONTACT_SUBMISSIONS_DIR=C:\services\website\data\contact`
- `CONTACT_NOTIFICATION_WEBHOOK_URL=<private webhook URL>`（若启用通知）
- `WEATHERAPI_KEY=<WeatherAPI.com Free key>`（server-only；禁止改名为 `NEXT_PUBLIC_WEATHERAPI_KEY`）
- `AI_PAGE_ANALYSIS_ENABLE_PUBLIC_CAPTURE=false`（server-only；只有精确值 `true` 才开启公网 URL 抓取）

`WEATHERAPI_KEY` 不参与浏览器构建，也不应进入 CI Artifact、Nginx 配置、URL 或日志。新增或轮换 key 后必须重启 NSSM/宝塔 Node 进程；单纯 reload Nginx 或刷新网页无效。

启动/重启：
```powershell
C:\tools\nssm\nssm.exe start meaningful-website
C:\tools\nssm\nssm.exe restart meaningful-website
```

---

## 5) Nginx 反代（meaningful.ink / www.meaningful.ink）
假设 Next.js 监听 `127.0.0.1:3000`。

查询 API 使用专用 Nginx access log，使 **这条 access log** 不写入城市等 query string；这不代表其他日志会自动脱敏。若 Nginx 由宝塔管理，通常从“软件商店（或运行环境）→ 已安装 → Nginx → 设置 → 配置修改/配置文件”进入包含顶层 `http {}` 的全局主配置，不要把下面内容贴进“网站 → 站点设置 → 配置文件”的单站点 `server {}`。

在全局主配置的 `http {}` 中放置一次。`log_format`、`limit_req_zone` 与 `limit_conn_zone` 必须位于 `http` 层，不能位于 `server` 或 `location`：

```nginx
log_format query_no_args '$remote_addr [$time_local] '
                         '"$request_method $uri $server_protocol" '
                         '$status $body_bytes_sent '
                         'rt=$request_time urt=$upstream_response_time';

# 可选；启用时同时取消下面 location 内对应指令的注释。
# limit_req_zone  $binary_remote_addr zone=query_per_ip:1m rate=20r/m;
# limit_conn_zone $binary_remote_addr zone=query_conn_per_ip:1m;

limit_req_zone  $binary_remote_addr zone=analyze_per_ip:1m rate=5r/m;
limit_conn_zone $server_name zone=analyze_global:1m;
```

在站点 `server {}` 中加入：

```nginx
location ^~ /api/query/ {
  proxy_pass http://127.0.0.1:3000;
  access_log logs/query-access.log query_no_args;

  proxy_set_header Host $http_host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $remote_addr;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_connect_timeout 5s;
  proxy_send_timeout 12s;
  proxy_read_timeout 12s;
  proxy_redirect off;

  # limit_req zone=query_per_ip burst=5 nodelay;
  # limit_conn query_conn_per_ip 2;
}

location = /api/analyze {
  proxy_pass http://127.0.0.1:3000;
  client_max_body_size 16k;
  proxy_set_header Host $http_host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $remote_addr;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_connect_timeout 5s;
  proxy_send_timeout 12s;
  proxy_read_timeout 12s;
  proxy_redirect off;
  limit_req zone=analyze_per_ip burst=2 nodelay;
  limit_req_status 429;
  limit_conn analyze_global 2;
  limit_conn_status 503;
}
```

日志格式只能使用不带参数的 `$uri`，不要换成 `$request`、`$request_uri` 或 `$args`。`logs/query-access.log` 是相对于 Nginx prefix 的路径；先对宝塔实际使用的 `nginx.exe` 运行 `nginx.exe -V 2>&1` 查看 prefix。若输出不足以确定位置，则以宝塔显示的实际安装目录、Nginx 启动工作目录和主配置为准，并通过一次测试查询确认真正写入的文件，不能凭空假定绝对路径。

这只能约束该 location 的这条 Nginx access log。上线前还要分别审计 Nginx `error_log`（尤其 debug/上游错误）、Node stdout/stderr/异常与 APM/trace、CDN/WAF/负载均衡日志，以及其他继承或并行的 `access_log`；若某层记录完整 URL，应在该层过滤/脱敏并设置保留期。可选限流应先观察共享 IP 下的正常流量再启用；它不能替代应用内缓存和 WeatherAPI 月调用预算。完整的宝塔配置与验证见 `docs/website/DEPLOY_WINDOWS_BAOTA.md`。

主站（HTTPS）示例：

```nginx
location / {
  proxy_pass http://127.0.0.1:3000;

  proxy_set_header Host $http_host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_set_header X-Forwarded-Host $host;
  proxy_set_header X-Forwarded-Port $server_port;

  proxy_connect_timeout 30s;
  proxy_send_timeout 60s;
  proxy_read_timeout 60s;
  proxy_redirect off;
}
```

可选：静态资源缓存

```nginx
location ^~ /_next/static/ {
  proxy_pass http://127.0.0.1:3000;
  expires 30d;
  add_header Cache-Control "public, max-age=2592000, immutable";
}
```

Reload：
```powershell
C:\nginx\nginx.exe -s reload
```

www → apex（如决定 `meaningful.ink` 为主站）：

```nginx
server {
  listen 80;
  server_name www.meaningful.ink;
  return 301 https://meaningful.ink$request_uri;
}
```

---

## 6) 上线验证点（每次部署后必做）
本机验证（Windows）：
```powershell
curl http://127.0.0.1:3000/
curl http://127.0.0.1:3000/api/contact/healthz
curl http://127.0.0.1:3000/api/query/healthz
curl http://127.0.0.1:3000/api/analyze/healthz
```

公网 URL 抓取默认关闭。关闭时 Safe Mock 不做 DNS 或出站请求；只有应用与 Nginx 限制均生效后，才考虑把服务端环境变量精确改为 `true` 并重启。开启后每次连接固定到逐跳验证的公网 IP，应用仍限制 16 KiB 请求体、2 个全局并发、10 秒总超时、2 MiB 响应和 3 次重定向。单机并发计数不支持多 Node 实例。

`/api/query/healthz` 只检查本地进程是否已读取运行时配置，不访问 WeatherAPI.com，也不得返回 key。设置或轮换 `WEATHERAPI_KEY` 后重启进程，再确认该接口本地就绪；不要让第三方短暂故障触发整站重启。

公网验证：
```powershell
curl -I https://meaningful.ink/
curl -I https://www.meaningful.ink/
```

人工检查：
- 首页 `/`、入口 `/enter`、`/blog`、`/labs`、`/tracker` 是否可访问
- `/rss.xml` 返回 `application/rss+xml`，并包含最新公开文章
- `/_next/static/` 返回 200（静态资源）
- 跳转策略符合预期（www ↔ apex）
- 联系页完成一次端到端测试提交，并确认持久目录收到 JSONL 记录；启用 webhook 时同时确认通知送达
- 查询页完成一次 current/forecast 实测；页面有 WeatherAPI.com attribution 和 Free 免责声明，缓存上限分别不超过 60 分钟/24 小时
- 已通过 `nginx.exe -V`/prefix 或实际安装目录确认 `query-access.log` 的真实位置；仅对这条专用 Nginx access log，确认只有 `/api/query/...` 路径，不含 `?`、城市、坐标或 `WEATHERAPI_KEY`
- 已分别审计 Nginx `error_log`、Node 应用 stdout/stderr/异常/APM、CDN/WAF/负载均衡和其他 access log；未把专用 access log 的结果误当作所有日志的保证

---

## 7) 回滚步骤（必须可用）
回滚目标：快速切回上一个可用 `BuildId`。

最短回滚（手工）：
1) 在 NSSM 中把 `Startup directory` 改回旧的 `C:\services\website\releases\<oldBuildId>`
2) `nssm restart meaningful-website`
3) 复用第 6 节验证

推荐做法（降低回滚耗时）：
- 维护 `C:\services\website\current` 指向某个 release 目录
- NSSM Startup directory 固定为 `C:\services\website\current`
- 部署/回滚只切换 `current` 指向并重启服务

---

## 8) 触发部署（Gitee）
在 Gitee Actions 手动触发 `website-cd-prod`：
- `build_id` 留空：默认使用当前 commit sha
- 或手填一个更友好的 build id（例如 `20260212-1`）

部署完成后按第 6 节验证。
