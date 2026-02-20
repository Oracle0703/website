param(
  [string]$ZipPath,
  [string]$Root = "C:\services\knock",
  [string]$ServiceName = "knock"
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($ZipPath)) {
  throw "Usage: knock-deploy.ps1 -ZipPath <path-to-zip>"
}

if (!(Test-Path $ZipPath)) {
  throw "zip not found: $ZipPath"
}

$releases = Join-Path $Root "releases"
New-Item -ItemType Directory -Force -Path $releases | Out-Null

$ts = (Get-Date).ToString("yyyyMMdd-HHmmss")
$dest = Join-Path $releases $ts
New-Item -ItemType Directory -Force -Path $dest | Out-Null

Expand-Archive -Path $ZipPath -DestinationPath $dest -Force

$current = Join-Path $releases "current"
if (Test-Path $current) {
  cmd /c "rmdir /S /Q \"$current\"" | Out-Null
}
cmd /c "mklink /J \"$current\" \"$dest\"" | Out-Null

$svc = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
if ($null -eq $svc) {
  Write-Host "Service $ServiceName not found. Run knock-install.ps1 once, then start the service."
} elseif ($svc.Status -eq "Running") {
  Restart-Service -Name $ServiceName
  Write-Host "Restarted service: $ServiceName"
} else {
  Start-Service -Name $ServiceName
  Write-Host "Started service: $ServiceName"
}

Write-Host "Deployed: $dest"
Write-Host "Current -> $current"
Write-Host "Health: http://127.0.0.1:3010/healthz"
