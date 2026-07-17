[CmdletBinding()]
param(
  [string]$RepositoryRoot = (Split-Path -Parent $PSScriptRoot),
  [string]$OutputDirectory,
  [string]$CommitSha = $env:GITHUB_SHA,
  [string]$SiteUrl = $env:NEXT_PUBLIC_SITE_URL
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Copy-DirectoryContents([string]$Source, [string]$Destination) {
  if (-not (Test-Path -LiteralPath $Source -PathType Container)) {
    throw "Required directory is missing: $Source"
  }

  New-Item -ItemType Directory -Path $Destination -Force | Out-Null
  Get-ChildItem -LiteralPath $Source -Force | ForEach-Object {
    Copy-Item -LiteralPath $_.FullName -Destination $Destination -Recurse -Force
  }
}

$RepositoryRoot = [System.IO.Path]::GetFullPath($RepositoryRoot)
if ([string]::IsNullOrWhiteSpace($OutputDirectory)) {
  $OutputDirectory = Join-Path $RepositoryRoot "dist\website-release"
}
$OutputDirectory = [System.IO.Path]::GetFullPath($OutputDirectory)

if ([string]::IsNullOrWhiteSpace($CommitSha)) {
  $CommitSha = (& git -C $RepositoryRoot rev-parse HEAD).Trim()
  if ($LASTEXITCODE -ne 0) { throw "Unable to determine the commit SHA." }
}
if ($CommitSha -notmatch "^[0-9a-fA-F]{40}$") {
  throw "CommitSha must be the full 40-character Git commit SHA. Got: $CommitSha"
}
if ($SiteUrl -notmatch "^https://") {
  throw "SiteUrl must be an HTTPS URL. Got: $SiteUrl"
}

$nodeTarget = (& node -p "process.platform + '-' + process.arch").Trim()
if ($LASTEXITCODE -ne 0) { throw "Unable to inspect the Node.js platform." }
if ($nodeTarget -ne "win32-x64") {
  throw "Windows x64 packaging must run under win32-x64 Node.js; got $nodeTarget. Do not ship a Linux standalone bundle to the Windows server."
}

$websiteRoot = Join-Path $RepositoryRoot "apps\website"
$standaloneRoot = Join-Path $websiteRoot ".next\standalone"
$staticRoot = Join-Path $websiteRoot ".next\static"
$publicRoot = Join-Path $websiteRoot "public"
$contentRoot = Join-Path $RepositoryRoot "content\blog"

if (-not (Test-Path -LiteralPath $standaloneRoot -PathType Container)) {
  throw "Standalone output is missing. Run npm run build:website first."
}

$shortSha = $CommitSha.Substring(0, 12).ToLowerInvariant()
$releaseName = "meaningful-website-windows-x64-$shortSha"
$stage = Join-Path $OutputDirectory $releaseName
$zipPath = Join-Path $OutputDirectory "$releaseName.zip"
$checksumPath = Join-Path $OutputDirectory "$releaseName.sha256"

New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null
if (Test-Path -LiteralPath $stage) { Remove-Item -LiteralPath $stage -Recurse -Force }
if (Test-Path -LiteralPath $zipPath) { Remove-Item -LiteralPath $zipPath -Force }
if (Test-Path -LiteralPath $checksumPath) { Remove-Item -LiteralPath $checksumPath -Force }
New-Item -ItemType Directory -Path $stage -Force | Out-Null

Copy-DirectoryContents $standaloneRoot $stage
Copy-DirectoryContents $staticRoot (Join-Path $stage "apps\website\.next\static")
Copy-DirectoryContents $publicRoot (Join-Path $stage "apps\website\public")

# Most blog routes are prerendered, but keeping source content in the package also
# preserves unknown-slug handling and the BLOG_CONTENT_ROOT runtime fallback.
Copy-DirectoryContents $contentRoot (Join-Path $stage "content\blog")
Copy-Item -LiteralPath (Join-Path $PSScriptRoot "start-website.cmd") -Destination (Join-Path $stage "start-website.cmd") -Force

$serverPath = Join-Path $stage "apps\website\server.js"
$buildIdPath = Join-Path $stage "apps\website\.next\BUILD_ID"
if (-not (Test-Path -LiteralPath $serverPath -PathType Leaf)) {
  throw "Unexpected standalone layout: apps\website\server.js is missing."
}
if (-not (Test-Path -LiteralPath $buildIdPath -PathType Leaf)) {
  throw "Unexpected standalone layout: apps\website\.next\BUILD_ID is missing."
}

$secretFiles = Get-ChildItem -LiteralPath $stage -Recurse -Force -File | Where-Object {
  $_.Name -eq ".env" -or $_.Name -like ".env.*"
}
if ($secretFiles) {
  throw "Refusing to package environment files: $($secretFiles.FullName -join ', ')"
}

$builtAt = (Get-Date).ToUniversalTime().ToString("o")
$manifest = [ordered]@{
  schemaVersion = 1
  repository = "Oracle0703/website"
  commitSha = $CommitSha.ToLowerInvariant()
  shortSha = $shortSha
  builtAt = $builtAt
  siteUrl = $SiteUrl.TrimEnd("/")
  platform = "win32"
  architecture = "x64"
  nodeVersion = (& node -p "process.version").Trim()
  startCommand = "start-website.cmd"
  healthEndpoints = @("/", "/api/contact/healthz", "/rss.xml")
}
$manifest | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $stage "release-manifest.json") -Encoding utf8

$archiveInputs = Get-ChildItem -LiteralPath $stage -Force | ForEach-Object { $_.FullName }
Compress-Archive -Path $archiveInputs -DestinationPath $zipPath -CompressionLevel Optimal

$hash = (Get-FileHash -LiteralPath $zipPath -Algorithm SHA256).Hash.ToLowerInvariant()
"$hash  $([System.IO.Path]::GetFileName($zipPath))" | Set-Content -LiteralPath $checksumPath -Encoding ascii

if (-not [string]::IsNullOrWhiteSpace($env:GITHUB_OUTPUT)) {
  Add-Content -LiteralPath $env:GITHUB_OUTPUT -Value "release_name=$releaseName"
  Add-Content -LiteralPath $env:GITHUB_OUTPUT -Value "zip_path=$zipPath"
  Add-Content -LiteralPath $env:GITHUB_OUTPUT -Value "checksum_path=$checksumPath"
}

Write-Host "Release: $zipPath"
Write-Host "SHA-256: $hash"
