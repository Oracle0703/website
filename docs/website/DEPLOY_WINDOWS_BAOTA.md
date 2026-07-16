# Website 发布手册（Windows 宝塔，小内存服务器）

当前正式发布方式是 **GitHub 在 Windows Runner 预构建，服务器只解压并切换目录**。服务器不再执行 `npm ci`、`npm install` 或 `next build`，因此部署时不会因为内存不足卡死。

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

脚本不包含密码或 webhook；这些值只配置在宝塔项目环境变量中。

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
```

`NEXT_PUBLIC_SITE_URL` 和 commit SHA 已在构建时固化。发布包自带 `content/blog`，正常情况下不需要设置 `BLOG_CONTENT_ROOT`。

## 启动与验收

在宝塔启动 Node 项目，然后在服务器 PowerShell 检查：

```powershell
$home = Invoke-WebRequest http://127.0.0.1:3001/ -UseBasicParsing
$home.StatusCode
$home.Headers["X-Release-Sha"]

Invoke-WebRequest http://127.0.0.1:3001/api/contact/healthz -UseBasicParsing
Invoke-WebRequest http://127.0.0.1:3001/rss.xml -UseBasicParsing
```

`X-Release-Sha` 应等于 GitHub Actions 页面显示的完整 commit SHA。随后检查公网：

```powershell
Invoke-WebRequest https://www.meaningful.ink/ -UseBasicParsing
Invoke-WebRequest https://www.meaningful.ink/en -UseBasicParsing
Invoke-WebRequest https://www.meaningful.ink/projects -UseBasicParsing
Invoke-WebRequest https://www.meaningful.ink/rss.xml -UseBasicParsing
```

最后人工打开首页、博客详情、项目详情和联系页，并提交一次测试联系表单，确认 `data\contact` 中产生记录。

## Nginx 反代

宝塔站点继续反代到本机端口：

```nginx
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

location ^~ /_next/static/ {
  proxy_pass http://127.0.0.1:3001;
  expires 30d;
  add_header Cache-Control "public, max-age=2592000, immutable";
}
```

Node 只监听环回地址，公网仍只开放 Nginx 的 80/443。

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
