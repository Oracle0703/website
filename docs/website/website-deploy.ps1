<#
.SYNOPSIS
  Deploy meaningful.ink website from a source zip uploaded by CI.

.DESCRIPTION
  This script is intended to be executed on the Windows Server via OpenSSH:
    powershell -NoProfile -ExecutionPolicy Bypass -File "C:\deploy\website-deploy.ps1" -BuildId "<id>" -ZipPath "C:/incoming/website-src-<id>.zip"

  It:
  - Expands the zip into a release directory.
  - Runs npm ci + build.
  - Restarts the configured NSSM service.

  IMPORTANT: This script does NOT manage TLS/DNS/Nginx.

.NOTES
  Keep secrets out of the repo. Prefer system environment variables.
#>

[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$BuildId,

  [Parameter(Mandatory = $true)]
  [string]$ZipPath,

  [string]$IncomingDir = "C:\\incoming",
  [string]$ReleasesDir = "C:\\services\\website\\releases",
  [string]$LogsDir = "C:\\logs\\website",

  [string]$ServiceName = "meaningful-website",
  [string]$NssmPath = "C:\\tools\\nssm\\nssm.exe"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Ensure-Dir([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path)) {
    New-Item -ItemType Directory -Path $Path | Out-Null
  }
}

function Run([string]$FilePath, [string[]]$Args, [string]$WorkingDirectory) {
  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = $FilePath
  $psi.WorkingDirectory = $WorkingDirectory
  $psi.RedirectStandardOutput = $true
  $psi.RedirectStandardError = $true
  $psi.UseShellExecute = $false
  foreach ($a in $Args) { [void]$psi.ArgumentList.Add($a) }

  $p = New-Object System.Diagnostics.Process
  $p.StartInfo = $psi

  if (-not $p.Start()) { throw "Failed to start: $FilePath" }

  $stdout = $p.StandardOutput.ReadToEnd()
  $stderr = $p.StandardError.ReadToEnd()
  $p.WaitForExit()

  if ($stdout) { Write-Host $stdout }
  if ($stderr) { Write-Host $stderr }
  if ($p.ExitCode -ne 0) { throw "Command failed ($($p.ExitCode)): $FilePath $($Args -join ' ')" }
}

if ([string]::IsNullOrWhiteSpace($BuildId)) {
  throw "BuildId is required."
}

# Prevent path traversal / weird folder names.
if ($BuildId -match "[\\/\\:\\*\\?\\\"\\<\\>\\|]") {
  throw "BuildId contains invalid path characters: $BuildId"
}

Ensure-Dir $IncomingDir
Ensure-Dir $ReleasesDir
Ensure-Dir $LogsDir

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logPath = Join-Path $LogsDir "deploy-$BuildId-$timestamp.log"

Start-Transcript -Path $logPath | Out-Null
try {
  if (-not (Test-Path -LiteralPath $ZipPath)) {
    throw "ZipPath not found: $ZipPath"
  }

  $releaseDir = Join-Path $ReleasesDir $BuildId

  if (Test-Path -LiteralPath $releaseDir) {
    throw "Release directory already exists: $releaseDir"
  }

  Write-Host "[deploy] BuildId=$BuildId"
  Write-Host "[deploy] ZipPath=$ZipPath"
  Write-Host "[deploy] ReleaseDir=$releaseDir"

  Ensure-Dir $releaseDir

  Write-Host "[deploy] Expanding archive..."
  Expand-Archive -LiteralPath $ZipPath -DestinationPath $releaseDir -Force

  # Basic sanity check (monorepo root contains package-lock.json).
  $lockPath = Join-Path $releaseDir "package-lock.json"
  if (-not (Test-Path -LiteralPath $lockPath)) {
    throw "package-lock.json not found after extract. Is the zip root correct?"
  }

  Write-Host "[deploy] npm ci"
  Run "npm" @("ci") $releaseDir

  Write-Host "[deploy] npm -w apps/website run build"
  Run "npm" @("-w", "apps/website", "run", "build") $releaseDir

  if (-not (Test-Path -LiteralPath $NssmPath)) {
    throw "NSSM not found at: $NssmPath"
  }

  Write-Host "[deploy] Restarting service: $ServiceName"
  & $NssmPath restart $ServiceName | Out-Null

  Write-Host "[deploy] Done."
}
finally {
  Stop-Transcript | Out-Null
}
