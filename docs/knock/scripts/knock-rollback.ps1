param(
  [string]$Root = "C:\services\knock",
  [string]$ServiceName = "knock"
)

$ErrorActionPreference = "Stop"

$releases = Join-Path $Root "releases"
$current = Join-Path $releases "current"

if (!(Test-Path $releases)) {
  throw "releases dir not found: $releases"
}

$dirs = Get-ChildItem -Path $releases -Directory | Where-Object { $_.Name -ne "current" } | Sort-Object Name -Descending
if ($dirs.Count -lt 2) {
  throw "need at least 2 releases to rollback"
}

$target = $dirs[1].FullName

if (Test-Path $current) {
  cmd /c "rmdir /S /Q \"$current\"" | Out-Null
}
cmd /c "mklink /J \"$current\" \"$target\"" | Out-Null

Restart-Service -Name $ServiceName -ErrorAction SilentlyContinue
Start-Service -Name $ServiceName

Write-Host "Rolled back to: $target"
Write-Host "Current -> $current"
