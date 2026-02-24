# Website 部署手册（Windows + 宝塔 + Nginx 反代）

目标：把 meaningful.ink 网站以本机 Node 进程方式运行（127.0.0.1:3001），由 Nginx 反代到公网域名。

## 目录约定（推荐：copy mode，避免指针/联接混乱）

- 运行目录（宝塔项目目录 + 实际启动 cwd）：
  - `C:\services\meaningful-website\current`
- 归档目录（可回滚留档）：
  - `C:\services\meaningful-website\releases\<ts>`
- 入站包（上传/CI 产物）：
  - `C:\services\meaningful-website\incoming\*.zip`

说明：不使用 `releases\current` 这种指针目录；`current` 下面就是正在运行的完整文件集。

## 宝塔启动命令（强制 cwd=project dir）

推荐把启动命令包一层 `cmd /c`，确保工作目录不会跑到 `C:\Users\Administrator`：

```bat
cmd /c "cd /d C:\services\meaningful-website\current && npm run start -w apps/website -- -p 3001 -H 127.0.0.1"
```

## 一次部署（解压 zip -> releases 归档 + 覆盖 current）

在管理员 PowerShell 执行（先在宝塔里停止 Node 项目）：

```powershell
$zip     = "C:\services\meaningful-website\incoming\prebuilt-YYYYMMDD-HHMM.zip"
$root    = "C:\services\meaningful-website"
$current = Join-Path $root "current"
$relRoot = Join-Path $root "releases"
$ts      = "prebuilt-" + (Get-Date -Format "yyyyMMdd-HHmmss")
$release = Join-Path $relRoot $ts

# 1) 解压到 releases\<ts>
New-Item -ItemType Directory -Path $release -Force | Out-Null
Expand-Archive -Path $zip -DestinationPath $release -Force

# 2) 覆盖 current（避免旧文件残留）
if (Test-Path $current) { Remove-Item -Recurse -Force $current }
New-Item -ItemType Directory -Path $current -Force | Out-Null
Copy-Item -Path (Join-Path $release "*") -Destination $current -Recurse -Force

Write-Host "OK: release=$release"
Write-Host "OK: current=$current"
```

## 回滚（把某个 releases 版本覆盖回 current）

```powershell
$root    = "C:\services\meaningful-website"
$current = Join-Path $root "current"
$release = "C:\services\meaningful-website\releases\prebuilt-YYYYMMDD-HHMMSS"

if (-not (Test-Path $release)) { throw "release not found: $release" }
if (Test-Path $current) { Remove-Item -Recurse -Force $current }
New-Item -ItemType Directory -Path $current -Force | Out-Null
Copy-Item -Path (Join-Path $release "*") -Destination $current -Recurse -Force

Write-Host "OK: rolled back current=$current from release=$release"
```

## 常见故障：/blog 显示“暂无文章”

原因：进程 `cwd` 跑偏导致读不到 `content/blog`。

- 兜底 1（推荐）：使用上面的宝塔启动命令，强制 `cd` 到 `current`。
- 兜底 2（代码兜底）：支持环境变量 `BLOG_CONTENT_ROOT` 指向 `C:\services\meaningful-website\current\content\blog`。
