param(
  [string]$Repo = "C:\repo\website",
  [string]$OutDir = "C:\repo\out",
  [string]$ZipName = "knock-win64",
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

function Assert-Path($p) {
  if (!(Test-Path $p)) { throw "path not found: $p" }
}

Assert-Path $Repo

$appsKnock = Join-Path $Repo "apps\knock"
Assert-Path $appsKnock

if (!$SkipBuild) {
  Push-Location $Repo
  try {
    npm ci
    npm run build:knock
  } finally {
    Pop-Location
  }
}

$dist = Join-Path $appsKnock "dist"
Assert-Path $dist
$distServer = Join-Path $dist "server.js"
$distPublic = Join-Path $dist "public"
Assert-Path $distServer
Assert-Path $distPublic

$stage = Join-Path $OutDir ("knock-stage-" + (Get-Date).ToString("yyyyMMdd-HHmmss"))
New-Item -ItemType Directory -Force -Path $stage | Out-Null

# Stage layout expected by deploy scripts:
# <release>\dist\server.js
# <release>\dist\public\...
#
# Do NOT copy dist/test or dist/src (tsc output); only ship runtime artifacts.
$stageDist = Join-Path $stage "dist"
New-Item -ItemType Directory -Force -Path $stageDist | Out-Null

Copy-Item -Force $distServer (Join-Path $stageDist "server.js")
Copy-Item -Recurse -Force $distPublic (Join-Path $stageDist "public")
Copy-Item -Force (Join-Path $appsKnock ".env.example") (Join-Path $stage ".env.example")

# Create a minimal runtime package.json and install only prod deps in the stage.
# This keeps the zip small and avoids shipping the entire monorepo node_modules.
$pkg = @{
  name = "knock-release"
  private = $true
  type = "module"
  dependencies = @{
    "better-sqlite3" = "^11.7.0"
  }
}
$pkgPath = Join-Path $stage "package.json"
$pkg | ConvertTo-Json -Depth 5 | Out-File -FilePath $pkgPath -Encoding utf8

Push-Location $stage
try {
  npm install --omit=dev
} finally {
  Pop-Location
}

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$zipPath = Join-Path $OutDir ($ZipName + "-" + (Get-Date).ToString("yyyyMMdd-HHmmss") + ".zip")

if (Test-Path $zipPath) { Remove-Item -Force $zipPath }
Compress-Archive -Path (Join-Path $stage "*") -DestinationPath $zipPath

Write-Host "Packed: $zipPath"
Write-Host "Next: use knock-deploy.ps1 -ZipPath $zipPath"
