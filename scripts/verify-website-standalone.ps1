[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$ReleaseDirectory,
  [int]$Port = 43101,
  [int]$TimeoutSeconds = 45
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ReleaseDirectory = [System.IO.Path]::GetFullPath($ReleaseDirectory)
$manifestPath = Join-Path $ReleaseDirectory "release-manifest.json"
$serverPath = Join-Path $ReleaseDirectory "apps\website\server.js"
$staticPath = Join-Path $ReleaseDirectory "apps\website\.next\static"
$publicPath = Join-Path $ReleaseDirectory "apps\website\public"
$contentPath = Join-Path $ReleaseDirectory "content\blog"

foreach ($requiredPath in @($manifestPath, $serverPath, $staticPath, $publicPath, $contentPath)) {
  if (-not (Test-Path -LiteralPath $requiredPath)) {
    throw "Release verification failed; required path is missing: $requiredPath"
  }
}

$manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
if ($manifest.platform -ne "win32" -or $manifest.architecture -ne "x64") {
  throw "Release target must be win32-x64."
}
if ($manifest.commitSha -notmatch "^[0-9a-f]{40}$") {
  throw "Release manifest contains an invalid commit SHA."
}

$tempRoot = if ($env:RUNNER_TEMP) { $env:RUNNER_TEMP } else { [System.IO.Path]::GetTempPath() }
$logId = [Guid]::NewGuid().ToString("N")
$stdoutPath = Join-Path $tempRoot "website-standalone-$logId.stdout.log"
$stderrPath = Join-Path $tempRoot "website-standalone-$logId.stderr.log"

$oldHostname = $env:HOSTNAME
$oldPort = $env:PORT
$oldNodeEnv = $env:NODE_ENV
$env:HOSTNAME = "127.0.0.1"
$env:PORT = $Port.ToString()
$env:NODE_ENV = "production"

$process = $null
try {
  $process = Start-Process -FilePath "node" `
    -ArgumentList @("apps\website\server.js") `
    -WorkingDirectory $ReleaseDirectory `
    -RedirectStandardOutput $stdoutPath `
    -RedirectStandardError $stderrPath `
    -PassThru

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  $baseUrl = "http://127.0.0.1:$Port"
  $homeResponse = $null

  while ((Get-Date) -lt $deadline) {
    if ($process.HasExited) {
      throw "Standalone server exited before becoming healthy (exit code $($process.ExitCode))."
    }

    try {
      $homeResponse = Invoke-WebRequest -Uri "$baseUrl/" -UseBasicParsing -TimeoutSec 5
      if ($homeResponse.StatusCode -eq 200) { break }
    }
    catch {
      Start-Sleep -Milliseconds 500
    }
  }

  if (-not $homeResponse -or $homeResponse.StatusCode -ne 200) {
    throw "Standalone server did not become healthy within $TimeoutSeconds seconds."
  }

  $releaseHeader = [string]$homeResponse.Headers["X-Release-Sha"]
  if ($releaseHeader -ne $manifest.commitSha) {
    throw "X-Release-Sha mismatch. Expected $($manifest.commitSha), got $releaseHeader."
  }

  foreach ($path in @("/api/contact/healthz", "/rss.xml", "/_next/image?url=%2Ficon-192.png&w=64&q=75")) {
    $response = Invoke-WebRequest -Uri "$baseUrl$path" -UseBasicParsing -TimeoutSec 15
    if ($response.StatusCode -ne 200) {
      throw "Health request failed for $path with status $($response.StatusCode)."
    }
  }

  Write-Host "Standalone release verified at $baseUrl (commit $($manifest.shortSha))."
}
catch {
  Write-Host "--- standalone stdout ---"
  if (Test-Path -LiteralPath $stdoutPath) { Get-Content -LiteralPath $stdoutPath }
  Write-Host "--- standalone stderr ---"
  if (Test-Path -LiteralPath $stderrPath) { Get-Content -LiteralPath $stderrPath }
  throw
}
finally {
  if ($process -and -not $process.HasExited) {
    Stop-Process -Id $process.Id -Force
    $process.WaitForExit()
  }

  $env:HOSTNAME = $oldHostname
  $env:PORT = $oldPort
  $env:NODE_ENV = $oldNodeEnv
}
