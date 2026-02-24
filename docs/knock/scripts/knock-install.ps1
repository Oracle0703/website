param(
  [string]$Root = "C:\services\knock",
  [string]$ServiceName = "knock",
  [string]$NssmPath = "C:\BtSoft\nssm\win64\nssm.exe"
)

$ErrorActionPreference = "Stop"

$current = Join-Path $Root "releases\current"
$envFile = Join-Path $Root "config.env"

if (!(Test-Path $NssmPath)) {
  throw "nssm not found: $NssmPath"
}

if (!(Test-Path $current)) {
  throw "current release not found: $current"
}

if (!(Test-Path $envFile)) {
  throw "config.env not found: $envFile"
}

$node = "C:\Program Files\nodejs\node.exe"
if (!(Test-Path $node)) {
  $node = (Get-Command node).Source
}

$script = Join-Path $current "dist\server.js"
if (!(Test-Path $script)) {
  throw "server entry not found: $script"
}

# NSSM will run: node --env-file=config.env dist/server.js
& $NssmPath install $ServiceName $node
& $NssmPath set $ServiceName AppDirectory $current
& $NssmPath set $ServiceName AppParameters "--env-file=\"$envFile\" \"$script\""
& $NssmPath set $ServiceName DisplayName "Knock Dashboard"
& $NssmPath set $ServiceName Start SERVICE_AUTO_START

# Optional: log to files
$logDir = Join-Path $Root "logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
& $NssmPath set $ServiceName AppStdout (Join-Path $logDir "stdout.log")
& $NssmPath set $ServiceName AppStderr (Join-Path $logDir "stderr.log")
& $NssmPath set $ServiceName AppRotateFiles 1
& $NssmPath set $ServiceName AppRotateOnline 1
& $NssmPath set $ServiceName AppRotateBytes 1048576

Start-Service -Name $ServiceName -ErrorAction SilentlyContinue

Write-Host "Installed service: $ServiceName"
Write-Host "Started service: $ServiceName"
Write-Host "Next: redeploy with knock-deploy.ps1 when you publish a new zip"
