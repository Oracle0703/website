<#
  Optional local Windows fallback for the GitHub website-windows-release job.
  Run this on a Windows x64 development machine, never on the small server.
#>

[CmdletBinding()]
param(
  [string]$SiteUrl = "https://www.meaningful.ink",
  [string]$OutputDirectory
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$root = $PSScriptRoot
Set-Location -LiteralPath $root

$commitSha = (& git rev-parse HEAD).Trim()
if ($LASTEXITCODE -ne 0 -or $commitSha -notmatch "^[0-9a-fA-F]{40}$") {
  throw "Unable to resolve a full Git commit SHA."
}

$env:NEXT_PUBLIC_SITE_URL = $SiteUrl
$env:NEXT_PUBLIC_RELEASE_SHA = $commitSha
$env:NEXT_TELEMETRY_DISABLED = "1"

& npm ci
if ($LASTEXITCODE -ne 0) { throw "npm ci failed." }

& npm run build:website
if ($LASTEXITCODE -ne 0) { throw "Website build failed." }

$arguments = @(
  "-RepositoryRoot", $root,
  "-CommitSha", $commitSha,
  "-SiteUrl", $SiteUrl
)
if (-not [string]::IsNullOrWhiteSpace($OutputDirectory)) {
  $arguments += @("-OutputDirectory", $OutputDirectory)
}

& (Join-Path $root "scripts\package-website-standalone.ps1") @arguments
if ($LASTEXITCODE -ne 0) { throw "Standalone packaging failed." }
