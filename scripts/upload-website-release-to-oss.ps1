<#
.SYNOPSIS
  Uploads a packaged Windows website release to Aliyun OSS.

.DESCRIPTION
  Called by website-windows-release after the GitHub Artifact upload on
  non-pull-request runs. Credentials come only from the process environment
  (ALIYUN_OSS_ACCESS_KEY_ID and ALIYUN_OSS_ACCESS_KEY_SECRET). The script
  copies them into the OSS_ACCESS_KEY_* variables read by ossutil 2 and never
  writes or prints those values.

  Objects:
    releases/<commitSha>/<releaseName>.zip
    releases/<commitSha>/<releaseName>.sha256
    releases/<commitSha>/release.json
    releases/latest.json   (main branch only)

  GitHub-hosted runners are outside the Chengdu VPC, so this upload uses the
  public endpoint. The Windows server pulls through the internal endpoint.
#>

[CmdletBinding()]
param(
  [switch]$SelfTest,
  [string]$ZipPath,
  [string]$ChecksumPath,
  [string]$ReleaseName,
  [string]$CommitSha,
  [string]$Bucket = "meaningful-website-releases",
  [string]$Region = "cn-chengdu",
  [string]$Endpoint = "https://oss-cn-chengdu.aliyuncs.com",
  [string]$GitRef = $env:GITHUB_REF,
  [switch]$UpdateLatest,
  [switch]$SkipLatest
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$script:ReleaseRepository = "Oracle0703/website"
$script:OssBucket = "meaningful-website-releases"
$script:OssRegion = "cn-chengdu"
$script:PublicEndpoint = "https://oss-cn-chengdu.aliyuncs.com"
$script:PublicEndpointHost = "oss-cn-chengdu.aliyuncs.com"
$script:InternalEndpointHost = "oss-cn-chengdu-internal.aliyuncs.com"
# Official ossutil 2.4.1 Windows x64 zip from gosspublic.alicdn.com.
# SHA-256 matches the Aliyun ossutil 2.0 download table (verified 2026-11-05).
$script:OssutilVersion = "2.4.1"
$script:OssutilSha256 = "06ebec1680ce68b1807393e65a1e3f5f99c3b69c9b47c40578a80187da4462c3"

function Get-ReleaseObjectNames([string]$Commit) {
  $normalized = $Commit.ToLowerInvariant()
  if ($normalized -notmatch "^[0-9a-f]{40}$") {
    throw "CommitSha must be the full 40-character Git commit SHA."
  }

  $shortSha = $normalized.Substring(0, 12)
  $objectReleaseName = "meaningful-website-windows-x64-$shortSha"
  $prefix = "releases/$normalized"
  return [pscustomobject]@{
    CommitSha = $normalized
    ShortSha = $shortSha
    ReleaseName = $objectReleaseName
    Prefix = $prefix
    ZipKey = "$prefix/$objectReleaseName.zip"
    Sha256Key = "$prefix/$objectReleaseName.sha256"
    ReleaseJsonKey = "$prefix/release.json"
    LatestKey = "releases/latest.json"
  }
}

function Read-ReleaseSha256([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
    throw "Checksum file not found: $Path"
  }
  $bytes = [System.IO.File]::ReadAllBytes($Path)
  if ($bytes.Length -gt 4096) {
    throw "Checksum file is unexpectedly large."
  }
  $text = [System.Text.Encoding]::ASCII.GetString($bytes)
  if ($text -notmatch "(?i)^\s*([0-9a-f]{64})(?:\s|$)") {
    throw "Checksum file does not start with a SHA-256 digest."
  }
  return $Matches[1].ToLowerInvariant()
}

function Test-ShouldPublishLatest([string]$Ref, [bool]$ForceUpdate, [bool]$ForceSkip) {
  if ($ForceUpdate -and $ForceSkip) {
    throw "Use only one of -UpdateLatest or -SkipLatest."
  }
  if ($ForceSkip) { return $false }
  if ($ForceUpdate) { return $true }
  return $Ref -eq "refs/heads/main"
}

function Assert-PublicUploadTarget([string]$TargetBucket, [string]$TargetRegion, [string]$TargetEndpoint) {
  if ($TargetBucket -ne $script:OssBucket) {
    throw "Refusing to upload outside bucket $($script:OssBucket)."
  }
  if ($TargetRegion -ne $script:OssRegion) {
    throw "Refusing to upload outside region $($script:OssRegion)."
  }

  $uri = $null
  if (-not [Uri]::TryCreate($TargetEndpoint, [UriKind]::Absolute, [ref]$uri)) {
    throw "OSS upload endpoint must be $($script:PublicEndpoint)."
  }
  if ($uri.Scheme -ne "https" -or -not $uri.IsDefaultPort -or $uri.UserInfo) {
    throw "OSS upload endpoint must be $($script:PublicEndpoint)."
  }
  if ($uri.Host -ne $script:PublicEndpointHost -or $uri.AbsolutePath -ne "/") {
    throw "GitHub-hosted runners must upload through $($script:PublicEndpoint)."
  }
}

function Assert-UploadInputs(
  [string]$SourceZip,
  [string]$SourceChecksum,
  [string]$ExpectedReleaseName,
  [string]$ExpectedCommitSha
) {
  $names = Get-ReleaseObjectNames $ExpectedCommitSha
  if ($ExpectedReleaseName -ne $names.ReleaseName) {
    throw "ReleaseName does not match CommitSha."
  }
  if (-not (Test-Path -LiteralPath $SourceZip -PathType Leaf)) {
    throw "Release zip not found: $SourceZip"
  }
  if ([System.IO.Path]::GetFileName($SourceZip) -ne "$($names.ReleaseName).zip") {
    throw "Release zip file name does not match the commit SHA."
  }
  if ([System.IO.Path]::GetFileName($SourceChecksum) -ne "$($names.ReleaseName).sha256") {
    throw "Checksum file name does not match the commit SHA."
  }

  $declared = Read-ReleaseSha256 $SourceChecksum
  $actual = (Get-FileHash -LiteralPath $SourceZip -Algorithm SHA256).Hash.ToLowerInvariant()
  if ($actual -ne $declared) {
    throw "Refusing to upload: zip SHA-256 does not match the checksum file."
  }

  return [pscustomobject]@{
    Names = $names
    Sha256 = $declared
  }
}

function New-ReleasePointerJson($Names, [string]$Sha256, [string]$UploadedAt) {
  if ($Sha256 -notmatch "^[0-9a-f]{64}$") {
    throw "Release pointer SHA-256 is invalid."
  }

  $pointer = [ordered]@{
    schemaVersion = 1
    repository = $script:ReleaseRepository
    commitSha = $Names.CommitSha
    shortSha = $Names.ShortSha
    releaseName = $Names.ReleaseName
    zipKey = $Names.ZipKey
    sha256Key = $Names.Sha256Key
    sha256 = $Sha256
    bucket = $script:OssBucket
    region = $script:OssRegion
    publicEndpoint = $script:PublicEndpointHost
    internalEndpoint = $script:InternalEndpointHost
    uploadedAt = $UploadedAt
  }
  if ($env:GITHUB_RUN_ID -match "^\d+$") {
    $pointer.workflowRunId = $env:GITHUB_RUN_ID
  }
  if ($env:GITHUB_SERVER_URL -and $env:GITHUB_REPOSITORY -and $env:GITHUB_RUN_ID -match "^\d+$") {
    $pointer.workflowRunUrl = "$($env:GITHUB_SERVER_URL.TrimEnd('/'))/$($env:GITHUB_REPOSITORY)/actions/runs/$($env:GITHUB_RUN_ID)"
  }

  return ($pointer | ConvertTo-Json -Depth 4)
}

function Assert-OssCredentialsPresent {
  if ([string]::IsNullOrWhiteSpace($env:ALIYUN_OSS_ACCESS_KEY_ID) -or
      [string]::IsNullOrWhiteSpace($env:ALIYUN_OSS_ACCESS_KEY_SECRET)) {
    throw "GitHub Actions secrets ALIYUN_OSS_ACCESS_KEY_ID and ALIYUN_OSS_ACCESS_KEY_SECRET are required."
  }
}

function Set-OssutilCredentialEnv {
  Assert-OssCredentialsPresent
  # ossutil 2 reads these exact names. Do not put credentials on the command line or in logs.
  $env:OSS_ACCESS_KEY_ID = $env:ALIYUN_OSS_ACCESS_KEY_ID
  $env:OSS_ACCESS_KEY_SECRET = $env:ALIYUN_OSS_ACCESS_KEY_SECRET
}

function Clear-OssCredentialEnv {
  foreach ($name in @(
      "OSS_ACCESS_KEY_ID",
      "OSS_ACCESS_KEY_SECRET",
      "ALIYUN_OSS_ACCESS_KEY_ID",
      "ALIYUN_OSS_ACCESS_KEY_SECRET"
    )) {
    Remove-Item -Path "Env:$name" -ErrorAction SilentlyContinue
  }
}

function Save-HttpToFile([string]$Url, [string]$Destination) {
  if (-not ("System.Net.Http.HttpClient" -as [type])) {
    Add-Type -AssemblyName System.Net.Http
  }

  $client = [System.Net.Http.HttpClient]::new()
  try {
    $client.Timeout = [TimeSpan]::FromMinutes(5)
    $response = $client.GetAsync($Url, [System.Net.Http.HttpCompletionOption]::ResponseHeadersRead).GetAwaiter().GetResult()
    try {
      if (-not $response.IsSuccessStatusCode) {
        throw "Failed to download ossutil: HTTP $([int]$response.StatusCode)."
      }
      $file = [System.IO.File]::Create($Destination)
      try {
        $remote = $response.Content.ReadAsStreamAsync().GetAwaiter().GetResult()
        try { $remote.CopyTo($file) }
        finally { $remote.Dispose() }
      }
      finally { $file.Dispose() }
    }
    finally { $response.Dispose() }
  }
  finally { $client.Dispose() }
}

function Install-PinnedOssutil {
  $root = if ($env:RUNNER_TEMP) { $env:RUNNER_TEMP } else { [System.IO.Path]::GetTempPath() }
  $dest = Join-Path $root "ossutil-$($script:OssutilVersion)"
  New-Item -ItemType Directory -Path $dest -Force | Out-Null
  $zip = Join-Path $dest "ossutil.zip"
  $url = "https://gosspublic.alicdn.com/ossutil/v2/$($script:OssutilVersion)/ossutil-$($script:OssutilVersion)-windows-amd64.zip"
  Save-HttpToFile $url $zip

  $actual = (Get-FileHash -LiteralPath $zip -Algorithm SHA256).Hash.ToLowerInvariant()
  if ($actual -ne $script:OssutilSha256) {
    Remove-Item -LiteralPath $zip -Force
    throw "Refusing to run ossutil: SHA-256 mismatch."
  }

  $extract = Join-Path $dest "extract"
  if (Test-Path -LiteralPath $extract) {
    Remove-Item -LiteralPath $extract -Recurse -Force
  }
  Expand-Archive -LiteralPath $zip -DestinationPath $extract -Force
  $exe = Join-Path (Join-Path $extract "ossutil-$($script:OssutilVersion)-windows-amd64") "ossutil.exe"
  if (-not (Test-Path -LiteralPath $exe -PathType Leaf)) {
    throw "ossutil.exe was not found in the downloaded archive."
  }
  return $exe
}

function Invoke-OssutilUpload([string]$OssutilPath, [string]$Source, [string]$ObjectKey) {
  $allowed = "^(releases/[0-9a-f]{40}/(meaningful-website-windows-x64-[0-9a-f]{12}\.(zip|sha256)|release\.json)|releases/latest\.json)$"
  if ($ObjectKey -notmatch $allowed) {
    throw "Refusing to upload unexpected OSS key."
  }

  & $OssutilPath cp --force --region $script:OssRegion --endpoint $script:PublicEndpoint $Source "oss://$($script:OssBucket)/$ObjectKey"
  if ($LASTEXITCODE -ne 0) {
    throw "ossutil upload failed for $ObjectKey (exit $LASTEXITCODE)."
  }
}

function Invoke-OssUpload {
  Assert-PublicUploadTarget $Bucket $Region $Endpoint
  $checked = Assert-UploadInputs $ZipPath $ChecksumPath $ReleaseName $CommitSha
  $publishLatest = Test-ShouldPublishLatest $GitRef ([bool]$UpdateLatest) ([bool]$SkipLatest)
  Assert-OssCredentialsPresent

  $pointerJson = New-ReleasePointerJson $checked.Names $checked.Sha256 ([DateTime]::UtcNow.ToString("o"))
  $tempDir = Join-Path ([System.IO.Path]::GetTempPath()) ("website-oss-" + [Guid]::NewGuid().ToString("n"))
  New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
  try {
    $pointerPath = Join-Path $tempDir "release.json"
    $utf8 = [System.Text.UTF8Encoding]::new($false)
    [System.IO.File]::WriteAllText($pointerPath, $pointerJson, $utf8)

    $ossutil = Install-PinnedOssutil
    $versionOutput = (& $ossutil version 2>&1 | Out-String)
    if ($LASTEXITCODE -ne 0 -or $versionOutput -notmatch [regex]::Escape($script:OssutilVersion)) {
      throw "ossutil version check failed."
    }
    Write-Host "Using ossutil $($script:OssutilVersion)"

    try {
      Set-OssutilCredentialEnv
      Invoke-OssutilUpload $ossutil $ZipPath $checked.Names.ZipKey
      Invoke-OssutilUpload $ossutil $ChecksumPath $checked.Names.Sha256Key
      Invoke-OssutilUpload $ossutil $pointerPath $checked.Names.ReleaseJsonKey
      if ($publishLatest) {
        Invoke-OssutilUpload $ossutil $pointerPath $checked.Names.LatestKey
        Write-Host "Updated $($checked.Names.LatestKey) -> $($checked.Names.CommitSha)"
      }
      else {
        Write-Host "Uploaded $($checked.Names.Prefix)/ without changing releases/latest.json."
      }
      Write-Host "Uploaded $($checked.Names.ZipKey)"
    }
    finally {
      Clear-OssCredentialEnv
    }
  }
  finally {
    if (Test-Path -LiteralPath $tempDir) {
      Remove-Item -LiteralPath $tempDir -Recurse -Force
    }
  }
}

function Invoke-OssUploadSelfTest {
  $commit = "0123456789abcdef0123456789abcdef01234567"
  $names = Get-ReleaseObjectNames $commit
  if ($names.ZipKey -ne "releases/$commit/meaningful-website-windows-x64-0123456789ab.zip") {
    throw "Release object key mismatch."
  }
  if ($names.Sha256Key -ne "releases/$commit/meaningful-website-windows-x64-0123456789ab.sha256") {
    throw "Checksum object key mismatch."
  }
  if ($names.LatestKey -ne "releases/latest.json") {
    throw "Latest pointer key mismatch."
  }

  $badCommit = $false
  try { Get-ReleaseObjectNames "not-a-sha" } catch { $badCommit = $true }
  if (-not $badCommit) { throw "Invalid commit SHA was accepted." }

  if (-not (Test-ShouldPublishLatest "refs/heads/main" $false $false)) {
    throw "main should update releases/latest.json."
  }
  if (Test-ShouldPublishLatest "refs/heads/feature" $false $false) {
    throw "Non-main refs must not move releases/latest.json."
  }
  if (Test-ShouldPublishLatest "" $false $false) {
    throw "A missing ref must not move releases/latest.json."
  }
  if (-not (Test-ShouldPublishLatest "refs/heads/feature" $true $false)) {
    throw "-UpdateLatest should force the pointer update."
  }
  if (Test-ShouldPublishLatest "refs/heads/main" $false $true) {
    throw "-SkipLatest should keep the previous pointer."
  }
  $bothSwitches = $false
  try { Test-ShouldPublishLatest "refs/heads/main" $true $true | Out-Null } catch { $bothSwitches = $true }
  if (-not $bothSwitches) { throw "Conflicting latest switches were accepted." }

  Assert-PublicUploadTarget $script:OssBucket $script:OssRegion $script:PublicEndpoint
  $rejectedEndpoint = $false
  try { Assert-PublicUploadTarget $script:OssBucket $script:OssRegion "https://$($script:InternalEndpointHost)" } catch { $rejectedEndpoint = $true }
  if (-not $rejectedEndpoint) { throw "Internal endpoint was accepted for the GitHub upload." }
  $rejectedBucket = $false
  try { Assert-PublicUploadTarget "other-bucket" $script:OssRegion $script:PublicEndpoint } catch { $rejectedBucket = $true }
  if (-not $rejectedBucket) { throw "Unexpected bucket was accepted." }

  $tempDir = Join-Path ([System.IO.Path]::GetTempPath()) ("website-oss-selftest-" + [Guid]::NewGuid().ToString("n"))
  New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
  try {
    $zip = Join-Path $tempDir "$($names.ReleaseName).zip"
    $checksum = Join-Path $tempDir "$($names.ReleaseName).sha256"
    [System.IO.File]::WriteAllText($zip, "not-a-real-zip")
    $hash = (Get-FileHash -LiteralPath $zip -Algorithm SHA256).Hash.ToLowerInvariant()
    [System.IO.File]::WriteAllText($checksum, "$hash  $($names.ReleaseName).zip`n")
    $checked = Assert-UploadInputs $zip $checksum $names.ReleaseName $commit
    if ($checked.Sha256 -ne $hash) { throw "Checksum parse mismatch." }

    $json = New-ReleasePointerJson $names $hash "2026-11-05T03:01:22.0000000Z"
    if ($json -match "ALIYUN_OSS_ACCESS_KEY|OSS_ACCESS_KEY|self-test-secret|LTAI") {
      throw "Release pointer contained credential material."
    }
    $parsed = $json | ConvertFrom-Json
    if ($parsed.schemaVersion -ne 1 -or $parsed.zipKey -ne $names.ZipKey -or $parsed.internalEndpoint -ne $script:InternalEndpointHost) {
      throw "Release pointer JSON is missing required fields."
    }

    [System.IO.File]::WriteAllText($checksum, ("0" * 64) + "  $($names.ReleaseName).zip`n")
    $mismatch = $false
    try { Assert-UploadInputs $zip $checksum $names.ReleaseName $commit | Out-Null } catch { $mismatch = $true }
    if (-not $mismatch) { throw "Mismatched checksum was accepted." }
  }
  finally {
    Remove-Item -LiteralPath $tempDir -Recurse -Force
  }

  $savedId = $env:ALIYUN_OSS_ACCESS_KEY_ID
  $savedSecret = $env:ALIYUN_OSS_ACCESS_KEY_SECRET
  try {
    Remove-Item -Path "Env:ALIYUN_OSS_ACCESS_KEY_ID" -ErrorAction SilentlyContinue
    Remove-Item -Path "Env:ALIYUN_OSS_ACCESS_KEY_SECRET" -ErrorAction SilentlyContinue
    $missing = $false
    try { Assert-OssCredentialsPresent } catch { $missing = $true }
    if (-not $missing) { throw "Missing OSS credentials were accepted." }

    $env:ALIYUN_OSS_ACCESS_KEY_ID = "self-test-access-key-id"
    $env:ALIYUN_OSS_ACCESS_KEY_SECRET = "self-test-secret"
    Set-OssutilCredentialEnv
    if ($env:OSS_ACCESS_KEY_ID -ne "self-test-access-key-id" -or $env:OSS_ACCESS_KEY_SECRET -ne "self-test-secret") {
      throw "ossutil credential environment was not populated."
    }
    Clear-OssCredentialEnv
    if (-not [string]::IsNullOrWhiteSpace($env:OSS_ACCESS_KEY_ID) -or -not [string]::IsNullOrWhiteSpace($env:OSS_ACCESS_KEY_SECRET)) {
      throw "ossutil credentials remained in the process environment."
    }
  }
  finally {
    Clear-OssCredentialEnv
    if (-not [string]::IsNullOrWhiteSpace($savedId)) { $env:ALIYUN_OSS_ACCESS_KEY_ID = $savedId }
    if (-not [string]::IsNullOrWhiteSpace($savedSecret)) { $env:ALIYUN_OSS_ACCESS_KEY_SECRET = $savedSecret }
  }

  if ($script:OssutilSha256 -notmatch "^[0-9a-f]{64}$") {
    throw "Pinned ossutil SHA-256 is invalid."
  }
  if ($script:OssutilVersion -ne "2.4.1") {
    throw "Pinned ossutil version drifted."
  }

  Write-Host "OSS upload self-test passed."
}

if ($SelfTest) {
  Invoke-OssUploadSelfTest
  return
}

Invoke-OssUpload
