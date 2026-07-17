# Website 发布手册（Windows 宝塔，小内存服务器）

当前正式发布方式是 **GitHub 在 Windows Runner 预构建，服务器只解压并切换目录**。服务器不再执行 `npm ci`、`npm install` 或 `next build`，因此部署时不会因为内存不足卡死。

> **端口与流程不可混用：本文的预构建 standalone + 宝塔流程固定使用 `127.0.0.1:3001`。`GO_LIVE_CHECKLIST.md` 保留的旧源码构建 + NSSM 流程使用 `127.0.0.1:3000`。启动命令、部署脚本、健康检查和 Nginx `proxy_pass` 必须全部属于同一套流程，不能从两份文档交叉复制。**

## 为什么发布包必须在 Windows 构建

Next.js standalone 会把实际运行所需的 Node 模块和原生二进制一起收进发布包。本站的图片优化使用 `sharp`，它包含平台相关二进制；Linux 构建出来的包不能直接放到 Windows Server 运行。

[Next.js 14 官方 standalone 文档](https://nextjs.org/docs/14/pages/api-reference/next-config-js/output)也明确说明：standalone 不会自动复制 `public` 与 `.next/static`，monorepo 需要设置 tracing root。因此仓库打包脚本显式补齐这两个目录，并将 tracing root 固定到仓库根目录。

`.github/workflows/website-windows-release.yml` 固定使用：

- `windows-latest` x64；
- Node.js `22.22.0`；
- `NEXT_PUBLIC_SITE_URL=https://www.meaningful.ink`；
- 当前 Git commit SHA（写入 `release-manifest.json` 和响应头 `X-Release-Sha`）。

构建后工作流会真实启动 standalone 包，检查首页、联系接口、RSS 和 `sharp` 图片优化，然后才上传 Artifact。

## 服务器目录

```text
C:\services\meaningful-website\
├─ current\                 # 宝塔实际运行目录
├─ incoming\                # 手动上传 zip / sha256
├─ releases\                # 自动保留的旧 current，可回滚
├─ deploy-website-prebuilt.ps1
└─ data\contact\            # 联系表单数据，必须在 current 外
```

`current` 是真实目录，不是软链接或目录联接。这就是 copy mode，可以避开宝塔与 Windows 服务对联接目录的兼容问题。

## 一次性准备

服务器只需要安装 **Windows x64 Node.js 22.22.0**，不需要安装 npm 依赖，也不需要保留 Git 仓库。

管理员 PowerShell：

```powershell
New-Item -ItemType Directory -Force C:\services\meaningful-website\incoming | Out-Null
New-Item -ItemType Directory -Force C:\services\meaningful-website\releases | Out-Null
New-Item -ItemType Directory -Force C:\services\meaningful-website\data\contact | Out-Null
node -p "process.platform + '-' + process.arch + ' ' + process.version"
```

最后一条应输出类似 `win32-x64 v22.22.0`。

联系表单目录包含姓名和回复渠道。请在 Windows ACL 中仅保留宝塔 Node 项目的运行账户、`SYSTEM` 与管理员访问权限；不要把该目录共享为静态目录，也不要使用目录联接或符号链接。

从仓库下载 [scripts/deploy-website-prebuilt.ps1](../../scripts/deploy-website-prebuilt.ps1)，保存到：

```text
C:\services\meaningful-website\deploy-website-prebuilt.ps1
```

脚本不包含密码、webhook 或天气服务密钥；这些值只配置在宝塔项目环境变量中。

## 获取发布包

合并到 `main` 后，GitHub Actions 的 `website-windows-release` 会自动运行。也可以在 GitHub → Actions → `website-windows-release` → Run workflow 手动触发。

成功后下载名称类似下面的 Artifact：

```text
meaningful-website-windows-x64-139dc35abcde
```

GitHub 下载的是外层 Artifact 压缩包。先在本地解开外层包，再把里面这两个文件上传到服务器 `incoming`：

```text
meaningful-website-windows-x64-139dc35abcde.zip
meaningful-website-windows-x64-139dc35abcde.sha256
```

`.sha256` 能发现下载或上传损坏，但不是数字签名；只应使用该仓库 GitHub Actions 产生的 Artifact。Artifact 默认保留 14 天。

## 每次部署

1. 在宝塔中停止当前 Node 项目。停止后再运行脚本，避免 Windows 锁住运行文件。
2. 在管理员 PowerShell 执行（替换实际文件名）：

```powershell
$root = "C:\services\meaningful-website"
$name = "meaningful-website-windows-x64-139dc35abcde"

powershell -NoProfile -ExecutionPolicy Bypass `
  -File "$root\deploy-website-prebuilt.ps1" `
  -ZipPath "$root\incoming\$name.zip" `
  -ChecksumPath "$root\incoming\$name.sha256" `
  -Root $root `
  -Port 3001 `
  -KeepReleases 3
```

脚本按顺序完成：

1. 校验 zip 的 SHA-256；
2. 拒绝目录穿越条目、错误平台、错误仓库和 `.env*` 文件；
3. 校验 `server.js`、静态资源、public、内容目录和发布清单；
4. 确认 `127.0.0.1:3001` 已停止监听；
5. 将旧 `current` 移到 `releases`，再切换新 `current`；
6. 默认只保留最近 3 个旧版本。

小硬盘可以使用 `-KeepReleases 1`，但至少保留一个可回滚版本。不要使用 `-SkipPortCheck`，除非已经通过其他方式确认 Node 进程完全停止。

## 宝塔项目配置

工作目录：

```text
C:\services\meaningful-website\current
```

启动文件或启动命令：

```bat
start-website.cmd
```

该脚本默认只监听 `127.0.0.1:3001`，并直接执行 `node apps\website\server.js`。不要再配置 `npm run start`。

宝塔环境变量建议：

```text
NODE_ENV=production
CONTACT_SUBMISSIONS_DIR=C:\services\meaningful-website\data\contact
CONTACT_NOTIFICATION_WEBHOOK_URL=<只在服务器填写，不要提交到 Git>
WEATHERAPI_KEY=<WeatherAPI.com Free key，只在服务器填写>
```

`NEXT_PUBLIC_SITE_URL` 和 commit SHA 已在构建时固化。发布包自带 `content/blog`，正常情况下不需要设置 `BLOG_CONTENT_ROOT`。

### WeatherAPI.com Free 上线准备

上线城市、天气和空气质量查询前，在 WeatherAPI.com 注册 Free 账户并创建 key；现在不需要把 key 提供给仓库、GitHub Actions 或发布包。Free 方案当前约束为每月 100,000 次调用，current 数据缓存不得超过 60 分钟，forecast 数据缓存不得超过 24 小时。页面还必须保留 WeatherAPI.com attribution 和 Free 方案要求的免责声明；这些项目未完成时不要开放查询入口。

应用内保护按小机器设置为：地点查询每 IP 20 次/分钟、天气查询每 IP 10 次/分钟，上游并发 4、等待队列 16；上游 cache miss 预算为 60 次/分钟、500 次/小时、2,500 次/UTC 日和 75,000 次/UTC 月。天气 fresh cache 为 15 分钟，stale fallback 的硬过期为 60 分钟；地点正结果最多缓存 60 分钟。预算计数只保存在当前 Node 进程内，进程重启后会清零，因此它是应用保护而不是账单级硬配额；仍需在 WeatherAPI.com 控制台观察真实月调用量。当前部署必须只运行一个 Node 实例，不启用 cluster、PM2 多实例或宝塔多副本；如果以后横向扩容，需先把配额与限流迁移到持久、原子、所有实例共享的 authority。

`WEATHERAPI_KEY` 是纯服务端运行时密钥：

- 只在宝塔 Node 项目的“环境变量”中设置；
- 不要写入 Git、`.env*`、PowerShell/cmd 启动脚本、Nginx 配置、URL、截图或发布文档；
- 不要创建 `NEXT_PUBLIC_WEATHERAPI_KEY`，也不要给任何密钥加 `NEXT_PUBLIC_` 前缀；
- GitHub Windows 构建不需要该 key；standalone 进程在服务器启动后读取环境变量；
- 修改或轮换 key 后必须完整停止并重新启动宝塔 Node 项目，仅刷新网页不会让旧进程读取新值；
- 如果 key 曾出现在仓库、浏览器响应或日志中，立即在 WeatherAPI.com 轮换，不要只删除历史中的明文。

首次配置时，在宝塔的 Node 项目设置中打开“环境变量”，新增名称 `WEATHERAPI_KEY`，把 Free key 直接填入值栏并保存；不要加引号，也不要改启动命令。随后先停止该项目，确认进程退出，再重新启动。宝塔版本若把环境变量放在“项目配置”或“运行环境”中，原则相同：变量必须属于实际运行 `start-website.cmd` 的 Node 进程，而不是只存在于管理员 PowerShell 会话。

## 启动与验收

在宝塔启动 Node 项目，然后在服务器 PowerShell 检查：

```powershell
$home = Invoke-WebRequest http://127.0.0.1:3001/ -UseBasicParsing
$home.StatusCode
$home.Headers["X-Release-Sha"]

Invoke-WebRequest http://127.0.0.1:3001/api/contact/healthz -UseBasicParsing
Invoke-WebRequest http://127.0.0.1:3001/api/query/healthz -UseBasicParsing
Invoke-WebRequest http://127.0.0.1:3001/rss.xml -UseBasicParsing
Invoke-WebRequest http://127.0.0.1:3001/manifest.webmanifest -UseBasicParsing
Invoke-WebRequest http://127.0.0.1:3001/sw.js -UseBasicParsing
```

`/api/query/healthz` 只检查本地路由和运行时配置是否就绪，不会请求 WeatherAPI.com，也不会验证或返回 key。设置或轮换 `WEATHERAPI_KEY` 并重启后，应确认该接口返回本地就绪状态；第三方短暂故障不应导致宝塔反复重启整个网站。

`X-Release-Sha` 应等于 GitHub Actions 页面显示的完整 commit SHA。随后检查公网：

```powershell
Invoke-WebRequest https://www.meaningful.ink/ -UseBasicParsing
Invoke-WebRequest https://www.meaningful.ink/en -UseBasicParsing
Invoke-WebRequest https://www.meaningful.ink/projects -UseBasicParsing
Invoke-WebRequest https://www.meaningful.ink/rss.xml -UseBasicParsing
```

最后人工打开首页、博客详情、项目详情和联系页，并提交一次测试联系表单，确认 `data\contact` 中产生记录。

查询功能上线时，再从页面完成一次固定城市的 current 与 forecast 查询，确认服务端可以出站访问 WeatherAPI.com、页面显示 attribution/免责声明，并确认响应与缓存策略没有超过 Free 方案的 60 分钟/24 小时上限。不要为了测试把 key 拼进浏览器 URL。

## Nginx 反代

宝塔站点继续反代到本机端口：

查询参数可能包含用户输入的城市。先从宝塔的全局 Nginx 入口进入主配置：通常为“软件商店（或运行环境）→ 已安装 → Nginx → 设置 → 配置修改/配置文件”；不同宝塔版本名称可能略有差异，目标是编辑包含顶层 `http {}` 的 **Nginx 主配置**，不是“网站 → 站点设置 → 配置文件”中的单站点 `server {}`。

在主配置的 `http {}` 中定义专用日志格式。`log_format`、`limit_req_zone` 和 `limit_conn_zone` 都只允许放在 `http` 层，不能放进宝塔站点的 `server` 或 `location`；下面的格式只让该查询 location 的专用 Nginx access log 不记录 query string：

```nginx
log_format query_no_args '$remote_addr [$time_local] '
                         '"$request_method $uri $server_protocol" '
                         '$status $body_bytes_sent '
                         'rt=$request_time urt=$upstream_response_time';

# 可选的小站保护。启用时，还要取消下方 /api/query/ location 中对应两行的注释。
# limit_req_zone  $binary_remote_addr zone=query_per_ip:1m rate=20r/m;
# limit_conn_zone $binary_remote_addr zone=query_conn_per_ip:1m;
```

`query_no_args` 只使用 `$uri`，不要改成 `$request`、`$request_uri` 或追加 `$args`。随后在同一站点的 `server {}` 中使用下面的 location；更长的 `/api/query/` 前缀会优先于现有 `/`：

```nginx
location ^~ /api/query/ {
  proxy_pass http://127.0.0.1:3001;
  access_log logs/query-access.log query_no_args;

  proxy_set_header Host $http_host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $remote_addr;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_connect_timeout 5s;
  proxy_send_timeout 12s;
  proxy_read_timeout 12s;
  proxy_redirect off;

  # 可选：先实测正常交互，再与 http {} 中的 zone 定义一起启用。
  # limit_req zone=query_per_ip burst=5 nodelay;
  # limit_conn query_conn_per_ip 2;
}

location / {
  proxy_pass http://127.0.0.1:3001;
  client_max_body_size 32k;
  proxy_set_header Host $http_host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $remote_addr;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_connect_timeout 15s;
  proxy_read_timeout 60s;
  proxy_redirect off;
}

# Service worker 必须每次重新验证，不能套用静态资源的 immutable 缓存。
location = /sw.js {
  proxy_pass http://127.0.0.1:3001;
  proxy_set_header Host $http_host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $remote_addr;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_hide_header Cache-Control;
  proxy_hide_header Service-Worker-Allowed;
  add_header Cache-Control "no-cache" always;
  add_header Service-Worker-Allowed "/" always;
}

location ^~ /_next/static/ {
  proxy_pass http://127.0.0.1:3001;
  expires 30d;
  add_header Cache-Control "public, max-age=2592000, immutable";
}
```

Node 只监听环回地址，公网仍只开放 Nginx 的 80/443。

PWA 只在 HTTPS（以及浏览器认可的 localhost 安全上下文）中注册。`/sw.js` 是每个构建生成的发布产物，内容包含当前 Next.js `BUILD_ID`；不要把它放进 `/_next/static/` 的 30 天 immutable 规则，也不要让 CDN 长时间缓存。它只预缓存 `/tracker`、`/en/tracker`、`/labs/tools`、`/en/labs/tools` 四个静态页面壳层、对应的中英文 Manifest 及其构建静态资源，不缓存 Contact、AI 分析、免费查询、搜索索引、RSS 或任何 `/api/*` 响应。发布后应在浏览器开发者工具的 Application → Service Workers/Cache Storage 中确认新版本进入 waiting/active 状态，并确认缓存条目没有 API URL。

`access_log logs/query-access.log ...` 中的 `logs/query-access.log` 是相对于 Nginx prefix 的路径，不要凭经验假定其绝对位置。先在管理员 PowerShell 使用宝塔实际安装的 `nginx.exe` 执行 `nginx.exe -V 2>&1`，查看构建参数中的 prefix；若输出未给出可直接采用的 prefix，则以宝塔显示的实际安装目录、Nginx 启动工作目录和主配置为准。执行一次查询后，必须在确认过的实际目录中找到新日志并核对时间戳。

保存配置后先对宝塔实际使用的 Nginx 执行 `nginx.exe -t`，成功后再 reload。通过页面发起一次查询并查看已经确认位置的 `query-access.log`：**仅对这条专用 Nginx access log**，应出现 `/api/query/...` 路径，但不应出现 `?` 后的参数、城市输入、坐标或 `WEATHERAPI_KEY`。专用 access log 会覆盖该 location 继承的普通 access log；不要在同一 location 再添加包含 `$request` 的第二条 access log。

这项配置不清洗 Nginx `error_log`，也不控制 Node 应用 stdout/stderr、异常与 APM/trace 日志，或站点前面的 CDN/WAF/负载均衡日志。上线前用一次可识别的测试查询逐项审计：

- Nginx `error_log`，尤其是 debug 日志和上游报错；
- 宝塔 Node 项目的 stdout/stderr、异常日志及启用的 APM/trace；
- CDN/WAF/负载均衡或其他反向代理的访问与错误日志；
- 当前站点是否还有继承或并行写入的其他 `access_log`。

确认这些日志源不会保存完整 query string、城市、坐标或密钥；若某一层默认记录完整 URL，应在该层配置字段过滤/脱敏并设置合适的保留期。不要把专用 access log 的验证结果扩大为“所有日志均不记录参数”。

可选的 `limit_req`/`limit_conn` 是外围保护，不替代应用内缓存、并发和月调用预算。共享办公网或移动运营商可能让多人共用一个 IP，因此先保持注释、观察正常请求频率，再启用建议值；出现误限流时优先调整 burst，不要放宽密钥边界。

联系接口优先使用 Nginx 覆盖写入的 `X-Real-IP` 做 IP 级限流，因此不要把 `127.0.0.1:3001` 直接开放到公网，也不要改成透传客户端提供的 `X-Real-IP`。Nginx 的 `32k` 限制与应用内流式限制共同保护小内存服务器。

执行非 dry-run 的联系记录清理前先停止宝塔 Node 项目，清理完成后再启动。应用内异步锁能协调同一 Node 进程中的 append 与 cleanup，但不能跨越单独启动的运维进程。

## 回滚

先在宝塔停止项目，在 `releases` 中选择上一个确认可用的 `previous-*` 目录，然后执行：

```powershell
$root = "C:\services\meaningful-website"
$old = "$root\releases\previous-OLD_SHA-YYYYMMDD-HHMMSS"
$failed = "$root\releases\failed-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

if (-not (Test-Path $old)) { throw "Rollback directory not found: $old" }
Move-Item "$root\current" $failed
try {
  Move-Item $old "$root\current"
}
catch {
  Move-Item $failed "$root\current"
  throw
}
```

重新在宝塔启动并重复上一节验收。联系表单数据位于 `current` 外，不会随回滚丢失。

## 常见故障

- **提示端口仍在监听**：宝塔项目还没有完全停止；等待几秒后重试，不要强行覆盖。
- **提示 checksum mismatch**：重新下载并上传 zip 与同批次 `.sha256`，不要继续部署。
- **提示 `sharp-win32-x64.node` 或启动时 native module 错误**：确认下载的是 `website-windows-release` 产物，而不是 Linux CI 文件。
- **首页正常但静态样式 404**：确认包内 `apps\website\.next\static` 存在，宝塔工作目录必须是 `current`。
- **联系表单无法保存**：检查 `CONTACT_SUBMISSIONS_DIR` 是否指向 `current` 外的可写目录。
- **`/api/query/healthz` 未就绪**：确认 `WEATHERAPI_KEY` 设置在当前宝塔 Node 项目而不是系统中另一个账户，完整停止/启动项目后再检查；接口不会联网验证 key。
- **查询返回上游授权错误**：在 WeatherAPI.com 控制台确认 Free key 状态并轮换；不要把 key 放到浏览器或查询 URL 中排查。
- **专用查询 access log 仍含参数**：确认 `/api/query/` location 只保留 `access_log ... query_no_args`，且格式没有 `$request`、`$request_uri` 或 `$args`，执行 `nginx.exe -t` 后 reload；其他日志按上一节单独审计。
