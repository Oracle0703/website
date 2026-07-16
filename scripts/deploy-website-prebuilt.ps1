<#
.SYNOPSIS
  Installs a prebuilt Windows standalone website release without npm install/build.

.DESCRIPTION
  Run this on the Windows server after stopping the Baota Node project. The
  script verifies SHA-256, validates archive paths and release metadata, keeps
  the previous current directory for rollback, then switches copy-mode current.
#>

[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$ZipPath,
  [string]$ChecksumPath,
  [string]$ExpectedSha256,
  [string]$Root = "C:\services\meaningful-website",
  [int]$Port = 3001,
  [ValidateRange(1, 20)]
  [int]$KeepReleases = 3,
  [switch]$SkipPortCheck
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Test-TcpPort([string]$HostName, [int]$TargetPort) {
  $client = New-Object System.Net.Sockets.TcpClient
  try {
    $task = $client.ConnectAsync($HostName, $TargetPort)
    if (-not $task.Wait(750)) { return $false }
    return $client.Connected
  }
  catch {
    return $false
  }
  finally {
    $client.Dispose()
  }
}

function Assert-SafeArchive([string]$ArchivePath, [string]$DestinationRoot) {
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  $archive = [System.IO.Compression.ZipFile]::OpenRead($ArchivePath)
  try {
    $rootPath = [System.IO.Path]::GetFullPath($DestinationRoot)
    $rootPrefix = $rootPath.TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar

    foreach ($entry in $archive.Entries) {
      $relativePath = $entry.FullName.Replace('/', [System.IO.Path]::DirectorySeparatorChar).Replace('\', [System.IO.Path]::DirectorySeparatorChar)
      $destination = [System.IO.Path]::GetFullPath((Join-Path $rootPath $relativePath))
      if (-not $destination.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Unsafe archive entry: $($entry.FullName)"
      }
    }
  }
  finally {
    $archive.Dispose()
  }
}

function Assert-ReleaseLayout([string]$ReleaseRoot) {
  $required = @(
    "release-manifest.json",
    "start-website.cmd",
    "apps\website\server.js",
    "apps\website\.next\BUILD_ID",
    "apps\website\.next\static",
    "apps\website\public",
    "content\blog"
  )

  foreach ($relativePath in $required) {
    $candidate = Join-Path $ReleaseRoot $relativePath
    if (-not (Test-Path -LiteralPath $candidate)) {
      throw "Invalid release: required path is missing: $relativePath"
    }
  }

  $manifest = Get-Content -LiteralPath (Join-Path $ReleaseRoot "release-manifest.json") -Raw | ConvertFrom-Json
  if ($manifest.schemaVersion -ne 1 -or $manifest.repository -ne "Oracle0703/website") {
    throw "Invalid release manifest repository or schema."
  }
  if ($manifest.platform -ne "win32" -or $manifest.architecture -ne "x64") {
    throw "This server runbook only accepts win32-x64 releases."
  }
  if ($manifest.commitSha -notmatch "^[0-9a-f]{40}$") {
    throw "Invalid release manifest commit SHA."
  }

  $environmentFiles = Get-ChildItem -LiteralPath $ReleaseRoot -Recurse -Force -File | Where-Object {
    $_.Name -eq ".env" -or $_.Name -like ".env.*"
  }
  if ($environmentFiles) {
    throw "Release unexpectedly contains environment files."
  }

  return $manifest
}

$ZipPath = [System.IO.Path]::GetFullPath($ZipPath)
$Root = [System.IO.Path]::GetFullPath($Root)
if (-not (Test-Path -LiteralPath $ZipPath -PathType Leaf)) {
  throw "Release zip not found: $ZipPath"
}

if ([string]::IsNullOrWhiteSpace($ExpectedSha256)) {
  if ([string]::IsNullOrWhiteSpace($ChecksumPath)) {
    $ChecksumPath = [System.IO.Path]::ChangeExtension($ZipPath, ".sha256")
  }
  $ChecksumPath = [System.IO.Path]::GetFullPath($ChecksumPath)
  if (-not (Test-Path -LiteralPath $ChecksumPath -PathType Leaf)) {
    throw "Checksum file not found. Upload the .sha256 file with the release, or pass -ExpectedSha256."
  }
  $checksumText = Get-Content -LiteralPath $ChecksumPath -Raw
  if ($checksumText -notmatch "(?i)^\s*([0-9a-f]{64})(?:\s|$)") {
    throw "Checksum file does not start with a valid SHA-256 value."
  }
  $ExpectedSha256 = $Matches[1]
}

if ($ExpectedSha256 -notmatch "(?i)^[0-9a-f]{64}$") {
  throw "ExpectedSha256 must contain exactly 64 hexadecimal characters."
}
$actualSha256 = (Get-FileHash -LiteralPath $ZipPath -Algorithm SHA256).Hash
if ($actualSha256 -ne $ExpectedSha256) {
  throw "Release checksum mismatch. Expected $ExpectedSha256, got $actualSha256."
}

$current = Join-Path $Root "current"
$releases = Join-Path $Root "releases"
$stage = Join-Path $Root (".stage-" + [Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $Root -Force | Out-Null
New-Item -ItemType Directory -Path $releases -Force | Out-Null
New-Item -ItemType Directory -Path $stage -Force | Out-Null

$backup = $null
try {
  Assert-SafeArchive $ZipPath $stage
  Expand-Archive -LiteralPath $ZipPath -DestinationPath $stage -Force
  $manifest = Assert-ReleaseLayout $stage

  if (-not $SkipPortCheck -and (Test-TcpPort "127.0.0.1" $Port)) {
    throw "Port $Port is still listening. Stop the Baota Node project before switching current."
  }

  if (Test-Path -LiteralPath $current) {
    $oldShortSha = "unknown"
    $oldManifestPath = Join-Path $current "release-manifest.json"
    if (Test-Path -LiteralPath $oldManifestPath -PathType Leaf) {
      try {
        $oldManifest = Get-Content -LiteralPath $oldManifestPath -Raw | ConvertFrom-Json
        if ($oldManifest.shortSha -match "^[0-9a-f]{12}$") { $oldShortSha = $oldManifest.shortSha }
      }
      catch {
        Write-Warning "Could not read the previous release manifest; using 'unknown' in the backup name."
      }
    }

    $backupName = "previous-$oldShortSha-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    $backup = Join-Path $releases $backupName
    Move-Item -LiteralPath $current -Destination $backup
  }

  try {
    Move-Item -LiteralPath $stage -Destination $current
  }
  catch {
    if ($backup -and (Test-Path -LiteralPath $backup) -and -not (Test-Path -LiteralPath $current)) {
      Move-Item -LiteralPath $backup -Destination $current
    }
    throw
  }

  Get-ChildItem -LiteralPath $releases -Directory | Sort-Object LastWriteTime -Descending | Select-Object -Skip $KeepReleases | ForEach-Object {
    try {
      Remove-Item -LiteralPath $_.FullName -Recurse -Force
    }
    catch {
      Write-Warning "Release installed, but old backup cleanup failed for $($_.FullName): $($_.Exception.Message)"
    }
  }

  Write-Host "Installed commit $($manifest.commitSha) into $current"
  if ($backup) { Write-Host "Rollback copy: $backup" }
  Write-Host "Start the Baota Node project, then verify http://127.0.0.1:$Port/api/contact/healthz"
}
finally {
  if (Test-Path -LiteralPath $stage) {
    Remove-Item -LiteralPath $stage -Recurse -Force
  }
}
