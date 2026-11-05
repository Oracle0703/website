<#
.SYNOPSIS
  Downloads a prebuilt Windows website release from Aliyun OSS.

.DESCRIPTION
  Run this on the Chengdu Windows server. The default endpoint is the
  same-region internal address. Credentials are read from
  ALIYUN_OSS_ACCESS_KEY_ID and ALIYUN_OSS_ACCESS_KEY_SECRET in the process
  environment, or from C:\services\meaningful-website\oss.env when those
  variables are empty. The env file must live outside any Git working tree.
  Secret values are never printed.

  After the zip and .sha256 land in incoming\, pass -Deploy to call
  deploy-website-prebuilt.ps1. Stop the Baota Node project first; -Deploy
  does not stop it.
#>

[CmdletBinding()]
param(
  [switch]$SelfTest,
  [string]$CommitSha,
  [string]$Bucket,
  [string]$Endpoint,
  [string]$Root = "C:\services\meaningful-website",
  [string]$EnvFile,
  [switch]$Deploy,
  [string]$DeployScript,
  [int]$Port = 3001,
  [ValidateRange(1, 20)]
  [int]$KeepReleases = 3
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$script:ReleaseRepository = "Oracle0703/website"
$script:OssBucket = "meaningful-website-releases"
$script:InternalEndpointHost = "oss-cn-chengdu-internal.aliyuncs.com"
$script:PublicEndpointHost = "oss-cn-chengdu.aliyuncs.com"
$script:MaxReleaseBytes = 1073741824
$script:CredentialNames = @(
  "ALIYUN_OSS_ACCESS_KEY_ID",
  "ALIYUN_OSS_ACCESS_KEY_SECRET",
  "ALIYUN_OSS_ENDPOINT"
)

function Get-ReleaseObjectNames([string]$Commit) {
  $normalized = $Commit.ToLowerInvariant()
  if ($normalized -notmatch "^[0-9a-f]{40}$") {
    throw "CommitSha must be the full 40-character hexadecimal Git commit SHA."
  }

  $shortSha = $normalized.Substring(0, 12)
  $releaseName = "meaningful-website-windows-x64-$shortSha"
  $prefix = "releases/$normalized"
  return [pscustomobject]@{
    CommitSha = $normalized
    ShortSha = $shortSha
    ReleaseName = $releaseName
    Prefix = $prefix
    ZipKey = "$prefix/$releaseName.zip"
    Sha256Key = "$prefix/$releaseName.sha256"
    ReleaseJsonKey = "$prefix/release.json"
    LatestKey = "releases/latest.json"
  }
}

function Get-PropertyValue($Object, [string]$Name) {
  if ($null -eq $Object) { return $null }
  $property = $Object.PSObject.Properties[$Name]
  if ($null -eq $property) { return $null }
  return $property.Value
}

function Assert-ReleasePointer($Pointer, [string]$ExpectedBucket) {
  $schemaVersion = Get-PropertyValue $Pointer "schemaVersion"
  if ($schemaVersion -ne 1) {
    throw "Unsupported OSS release pointer schema."
  }
  if ((Get-PropertyValue $Pointer "repository") -ne $script:ReleaseRepository) {
    throw "OSS release pointer is for a different repository."
  }
  if ((Get-PropertyValue $Pointer "bucket") -ne $ExpectedBucket) {
    throw "OSS release pointer bucket does not match $ExpectedBucket."
  }

  $commit = [string](Get-PropertyValue $Pointer "commitSha")
  $names = Get-ReleaseObjectNames $commit
  $releaseName = [string](Get-PropertyValue $Pointer "releaseName")
  $zipKey = [string](Get-PropertyValue $Pointer "zipKey")
  $sha256Key = [string](Get-PropertyValue $Pointer "sha256Key")
  $sha256 = [string](Get-PropertyValue $Pointer "sha256")
  if ($releaseName -ne $names.ReleaseName -or $zipKey -ne $names.ZipKey -or $sha256Key -ne $names.Sha256Key) {
    throw "OSS release pointer keys do not match the commit SHA."
  }
  if ($sha256 -notmatch "^[0-9a-fA-F]{64}$") {
    throw "OSS release pointer SHA-256 is invalid."
  }

  return [pscustomobject]@{
    CommitSha = $names.CommitSha
    ShortSha = $names.ShortSha
    ReleaseName = $names.ReleaseName
    ZipKey = $names.ZipKey
    Sha256Key = $names.Sha256Key
    Sha256 = $sha256.ToLowerInvariant()
    ReleaseJsonKey = $names.ReleaseJsonKey
    LatestKey = $names.LatestKey
  }
}

function Read-ReleaseSha256([string]$Path) {
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

function Get-OssAuthorization(
  [string]$Method,
  [string]$TargetBucket,
  [string]$Key,
  [string]$AccessKeyId,
  [string]$AccessKeySecret,
  [string]$Date
) {
  if ($Method -ne "GET") { throw "Only OSS GET is supported." }
  if ($Date -notmatch "^[A-Za-z]{3}, \d{2} [A-Za-z]{3} \d{4} \d{2}:\d{2}:\d{2} GMT$") {
    throw "OSS Date header is not an RFC 1123 GMT timestamp."
  }
  if ($Key -match "[\r\n]" -or $TargetBucket -match "[\r\n]" -or $AccessKeyId -match "[\r\n]") {
    throw "OSS request fields contain a newline."
  }

  $newline = "`n"
  $stringToSign = "GET$newline$newline$newline$Date$newline/$TargetBucket/$Key"
  $hmac = [System.Security.Cryptography.HMACSHA1]::new([System.Text.Encoding]::UTF8.GetBytes($AccessKeySecret))
  try {
    $signature = [Convert]::ToBase64String($hmac.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($stringToSign)))
  }
  finally {
    $hmac.Dispose()
  }
  return "OSS ${AccessKeyId}:$signature"
}

function Resolve-OssEndpoint([string]$Value, [switch]$AllowLoopback) {
  $text = $Value.Trim()
  if ($text -notmatch "^[a-zA-Z][a-zA-Z0-9+.-]*://") {
    $text = "https://$text"
  }

  $uri = $null
  if (-not [Uri]::TryCreate($text, [UriKind]::Absolute, [ref]$uri)) {
    throw "OSS endpoint is not a valid URL."
  }
  if ($uri.UserInfo -or $uri.Query -or $uri.Fragment) {
    throw "OSS endpoint must not include credentials, a query, or a fragment."
  }
  if ($uri.AbsolutePath -ne "/") {
    throw "OSS endpoint must be a host, not a path."
  }

  $loopback = $uri.IsLoopback -or $uri.Host -eq "localhost"
  if ($loopback) {
    if (-not $AllowLoopback -or $uri.Scheme -ne "http") {
      throw "Loopback OSS endpoints are only available to the self-test."
    }
    return $uri
  }

  $allowed = @($script:InternalEndpointHost, $script:PublicEndpointHost)
  if ($uri.Scheme -ne "https" -or -not $uri.IsDefaultPort -or $allowed -notcontains $uri.Host) {
    throw "Endpoint must be https://$($script:InternalEndpointHost) or https://$($script:PublicEndpointHost)."
  }
  return $uri
}

function Get-OssObjectUri([string]$TargetBucket, [Uri]$EndpointUri, [string]$Key, [string]$AddressingStyle) {
  $builder = [System.UriBuilder]::new($EndpointUri.Scheme, $EndpointUri.Host, $EndpointUri.Port)
  if ($AddressingStyle -eq "path") {
    $builder.Path = "/$TargetBucket/$Key"
  }
  else {
    $builder.Host = "$TargetBucket.$($EndpointUri.Host)"
    $builder.Path = "/$Key"
  }
  return $builder.Uri
}

function Copy-StreamLimited($SourceStream, $DestinationStream, [long]$MaxBytes) {
  $buffer = New-Object byte[] 81920
  $total = [int64]0
  while (($read = $SourceStream.Read($buffer, 0, $buffer.Length)) -gt 0) {
    $total += $read
    if ($total -gt $MaxBytes) {
      throw "OSS object exceeds the $MaxBytes byte download limit."
    }
    $DestinationStream.Write($buffer, 0, $read)
  }
  return $total
}

function Receive-OssObject(
  [string]$TargetBucket,
  [string]$EndpointValue,
  [string]$Key,
  [string]$Destination,
  [string]$AccessKeyId,
  [string]$AccessKeySecret,
  [string]$Date,
  [switch]$AllowLoopback,
  [long]$MaxBytes = 1073741824
) {
  if ($Key -notmatch "^(releases/latest\.json|releases/[0-9a-f]{40}/(meaningful-website-windows-x64-[0-9a-f]{12}\.(zip|sha256)|release\.json))$") {
    throw "Refusing to download unexpected OSS key."
  }
  if ([string]::IsNullOrWhiteSpace($AccessKeyId) -or [string]::IsNullOrWhiteSpace($AccessKeySecret)) {
    throw "ALIYUN_OSS_ACCESS_KEY_ID and ALIYUN_OSS_ACCESS_KEY_SECRET are required."
  }

  $endpointUri = Resolve-OssEndpoint $EndpointValue -AllowLoopback:$AllowLoopback
  $style = "virtual"
  if ($AllowLoopback -and ($endpointUri.IsLoopback -or $endpointUri.Host -eq "localhost")) {
    $style = "path"
  }
  $uri = Get-OssObjectUri $TargetBucket $endpointUri $Key $style
  if ([string]::IsNullOrWhiteSpace($Date)) {
    $Date = [DateTime]::UtcNow.ToString("ddd, dd MMM yyyy HH:mm:ss 'GMT'", [System.Globalization.CultureInfo]::InvariantCulture)
  }
  $authorization = Get-OssAuthorization "GET" $TargetBucket $Key $AccessKeyId $AccessKeySecret $Date

  if (-not ("System.Net.Http.HttpClient" -as [type])) {
    Add-Type -AssemblyName System.Net.Http
  }
  try {
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor [System.Net.SecurityProtocolType]::Tls12
  }
  catch {
    Write-Warning "Could not enable TLS 1.2 explicitly; continuing with the process default."
  }

  $handler = [System.Net.Http.HttpClientHandler]::new()
  $handler.AllowAutoRedirect = $false
  if ($endpointUri.Host -like "*-internal.*" -or $endpointUri.IsLoopback) {
    $handler.UseProxy = $false
  }
  $client = [System.Net.Http.HttpClient]::new($handler)
  $parent = [System.IO.Path]::GetDirectoryName($Destination)
  if (-not (Test-Path -LiteralPath $parent)) {
    New-Item -ItemType Directory -Path $parent -Force | Out-Null
  }

  $completed = $false
  try {
    $client.Timeout = [TimeSpan]::FromMinutes(30)
    $request = [System.Net.Http.HttpRequestMessage]::new([System.Net.Http.HttpMethod]::Get, $uri)
    [void]$request.Headers.TryAddWithoutValidation("Date", $Date)
    [void]$request.Headers.TryAddWithoutValidation("Authorization", $authorization)
    [void]$request.Headers.TryAddWithoutValidation("User-Agent", "meaningful-website-release-pull/1")
    $response = $client.SendAsync($request, [System.Net.Http.HttpCompletionOption]::ResponseHeadersRead).GetAwaiter().GetResult()
    try {
      if (-not $response.IsSuccessStatusCode) {
        $errorText = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
        if ($errorText.Length -gt 2000) { $errorText = $errorText.Substring(0, 2000) }
        throw "OSS download failed for ${Key}: HTTP $([int]$response.StatusCode) $errorText"
      }
      $lengthHeader = $response.Content.Headers.ContentLength
      if ($null -ne $lengthHeader -and $lengthHeader -gt $MaxBytes) {
        throw "OSS object $Key declares $lengthHeader bytes, above the $MaxBytes byte limit."
      }

      $file = [System.IO.File]::Create($Destination)
      try {
        $remote = $response.Content.ReadAsStreamAsync().GetAwaiter().GetResult()
        try { Copy-StreamLimited $remote $file $MaxBytes | Out-Null }
        finally { $remote.Dispose() }
      }
      finally { $file.Dispose() }
      $completed = $true
    }
    finally { $response.Dispose() }
  }
  finally {
    $client.Dispose()
    if (-not $completed -and (Test-Path -LiteralPath $Destination)) {
      Remove-Item -LiteralPath $Destination -Force
    }
  }
}

function Assert-CredentialFileOutsideGit([string]$Path) {
  $full = [System.IO.Path]::GetFullPath($Path)
  $directory = [System.IO.Path]::GetDirectoryName($full)
  while (-not [string]::IsNullOrWhiteSpace($directory)) {
    if (Test-Path -LiteralPath (Join-Path $directory ".git")) {
      throw "Refusing to read OSS credentials from a Git working tree ($full). Keep oss.env outside the repository."
    }
    $parent = [System.IO.Path]::GetDirectoryName($directory)
    if ($parent -eq $directory) { break }
    $directory = $parent
  }
}

function Read-CredentialText([string]$Path) {
  $bytes = [System.IO.File]::ReadAllBytes($Path)
  if ($bytes.Length -gt 16384) {
    throw "OSS credential file is unexpectedly large."
  }
  if ($bytes.Length -ge 2 -and $bytes[0] -eq 255 -and $bytes[1] -eq 254) {
    return [System.Text.Encoding]::Unicode.GetString($bytes, 2, $bytes.Length - 2)
  }
  if ($bytes.Length -ge 3 -and $bytes[0] -eq 239 -and $bytes[1] -eq 187 -and $bytes[2] -eq 191) {
    return [System.Text.Encoding]::UTF8.GetString($bytes, 3, $bytes.Length - 3)
  }
  return [System.Text.Encoding]::UTF8.GetString($bytes)
}

function Import-OssCredentialFile([string]$Path) {
  Assert-CredentialFileOutsideGit $Path
  if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
    throw "OSS credential file not found: $Path"
  }

  $allowed = @{}
  foreach ($name in $script:CredentialNames) { $allowed[$name] = $true }
  $lineNumber = 0
  foreach ($line in (Read-CredentialText $Path) -split "\r?\n") {
    $lineNumber++
    $trimmed = $line.Trim()
    if ($trimmed.Length -eq 0 -or $trimmed.StartsWith("#")) { continue }
    $separator = $trimmed.IndexOf("=")
    if ($separator -lt 1) {
      throw "Invalid OSS credential file line $lineNumber."
    }
    $name = $trimmed.Substring(0, $separator).Trim()
    $value = $trimmed.Substring($separator + 1).Trim()
    if (-not $allowed.ContainsKey($name)) {
      throw "OSS credential file line $lineNumber uses unsupported name $name."
    }
    if ($value.Length -ge 2) {
      $quote = $value.Substring(0, 1)
      if (($quote -eq '"' -or $quote -eq "'") -and $value.EndsWith($quote)) {
        $value = $value.Substring(1, $value.Length - 2)
      }
    }
    if ([string]::IsNullOrWhiteSpace($value)) {
      throw "OSS credential file line $lineNumber has an empty value."
    }
    $existing = [Environment]::GetEnvironmentVariable($name, "Process")
    if ([string]::IsNullOrWhiteSpace($existing)) {
      [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
  }
}

function Get-RequiredCredential([string]$Name) {
  $value = [Environment]::GetEnvironmentVariable($Name, "Process")
  if ([string]::IsNullOrWhiteSpace($value)) {
    throw "Missing $Name. Set it in the process environment or in the server oss.env file."
  }
  return $value
}

function Resolve-OptionalSetting([bool]$WasBound, [string]$Explicit, [string]$EnvName, [string]$Default) {
  if ($WasBound -and -not [string]::IsNullOrWhiteSpace($Explicit)) {
    return $Explicit.Trim()
  }
  $fromEnv = [Environment]::GetEnvironmentVariable($EnvName, "Process")
  if (-not [string]::IsNullOrWhiteSpace($fromEnv)) {
    return $fromEnv.Trim()
  }
  return $Default
}

function Copy-VerifiedRelease([string]$PartialPath, [string]$FinalPath) {
  $parent = [System.IO.Path]::GetDirectoryName($FinalPath)
  if (-not (Test-Path -LiteralPath $parent)) {
    New-Item -ItemType Directory -Path $parent -Force | Out-Null
  }
  Move-Item -LiteralPath $PartialPath -Destination $FinalPath -Force
}

function Invoke-OssPull {
  $rootFull = [System.IO.Path]::GetFullPath($Root)
  if ($PSBoundParameters.ContainsKey("EnvFile")) {
    Import-OssCredentialFile $EnvFile
  }
  else {
    $defaultEnvFile = Join-Path $rootFull "oss.env"
    if (Test-Path -LiteralPath $defaultEnvFile -PathType Leaf) {
      Import-OssCredentialFile $defaultEnvFile
    }
  }

  $resolvedBucket = Resolve-OptionalSetting ($PSBoundParameters.ContainsKey("Bucket")) $Bucket "ALIYUN_OSS_BUCKET" $script:OssBucket
  if ($resolvedBucket -ne $script:OssBucket) {
    throw "This runbook only pulls from bucket $($script:OssBucket)."
  }
  $resolvedEndpoint = Resolve-OptionalSetting ($PSBoundParameters.ContainsKey("Endpoint")) $Endpoint "ALIYUN_OSS_ENDPOINT" $script:InternalEndpointHost
  $endpointUri = Resolve-OssEndpoint $resolvedEndpoint
  $accessKeyId = Get-RequiredCredential "ALIYUN_OSS_ACCESS_KEY_ID"
  $accessKeySecret = Get-RequiredCredential "ALIYUN_OSS_ACCESS_KEY_SECRET"

  $incoming = [System.IO.Path]::GetFullPath((Join-Path $rootFull "incoming"))
  $rootPrefix = $rootFull.TrimEnd("\", "/") + [System.IO.Path]::DirectorySeparatorChar
  if (-not $incoming.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Incoming directory escapes the release root."
  }
  New-Item -ItemType Directory -Path $incoming -Force | Out-Null

  $endpointText = $endpointUri.AbsoluteUri.TrimEnd("/")
  $tempDir = Join-Path ([System.IO.Path]::GetTempPath()) ("website-oss-pull-" + [Guid]::NewGuid().ToString("n"))
  New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
  try {
    $pointerKey = "releases/latest.json"
    if (-not [string]::IsNullOrWhiteSpace($CommitSha)) {
      $pointerKey = (Get-ReleaseObjectNames $CommitSha).ReleaseJsonKey
    }
    $pointerPath = Join-Path $tempDir "pointer.json"
    Write-Host "Downloading $pointerKey"
    Receive-OssObject $resolvedBucket $endpointText $pointerKey $pointerPath $accessKeyId $accessKeySecret "" -MaxBytes 65536
    $pointerText = [System.IO.File]::ReadAllText($pointerPath, [System.Text.Encoding]::UTF8)
    $pointer = Assert-ReleasePointer ($pointerText | ConvertFrom-Json) $resolvedBucket
    if (-not [string]::IsNullOrWhiteSpace($CommitSha) -and $pointer.CommitSha -ne (Get-ReleaseObjectNames $CommitSha).CommitSha) {
      throw "OSS release.json commit does not match -CommitSha."
    }

    $partialChecksum = Join-Path $tempDir "$($pointer.ReleaseName).sha256.partial"
    $partialZip = Join-Path $tempDir "$($pointer.ReleaseName).zip.partial"
    Write-Host "Downloading $($pointer.Sha256Key)"
    Receive-OssObject $resolvedBucket $endpointText $pointer.Sha256Key $partialChecksum $accessKeyId $accessKeySecret "" -MaxBytes 4096
    $checksum = Read-ReleaseSha256 $partialChecksum
    if ($checksum -ne $pointer.Sha256) {
      throw "Checksum object does not match the release pointer."
    }

    Write-Host "Downloading $($pointer.ZipKey)"
    Receive-OssObject $resolvedBucket $endpointText $pointer.ZipKey $partialZip $accessKeyId $accessKeySecret "" -MaxBytes $script:MaxReleaseBytes
    $actual = (Get-FileHash -LiteralPath $partialZip -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($actual -ne $checksum) {
      throw "Downloaded zip SHA-256 does not match the checksum from OSS. Expected $checksum, got $actual."
    }

    $finalZip = Join-Path $incoming "$($pointer.ReleaseName).zip"
    $finalChecksum = Join-Path $incoming "$($pointer.ReleaseName).sha256"
    Copy-VerifiedRelease $partialZip $finalZip
    Copy-VerifiedRelease $partialChecksum $finalChecksum
  }
  finally {
    if (Test-Path -LiteralPath $tempDir) {
      Remove-Item -LiteralPath $tempDir -Recurse -Force
    }
  }

  $accessKeyId = $null
  $accessKeySecret = $null
  Remove-Item -Path "Env:ALIYUN_OSS_ACCESS_KEY_ID" -ErrorAction SilentlyContinue
  Remove-Item -Path "Env:ALIYUN_OSS_ACCESS_KEY_SECRET" -ErrorAction SilentlyContinue

  if ([string]::IsNullOrWhiteSpace($DeployScript)) {
    $DeployScript = Join-Path $rootFull "deploy-website-prebuilt.ps1"
  }
  Write-Host "Downloaded commit $($pointer.CommitSha) to $finalZip"

  if ($Deploy) {
    if (-not (Test-Path -LiteralPath $DeployScript -PathType Leaf)) {
      throw "Deploy script not found: $DeployScript"
    }
    Write-Host "Calling deploy-website-prebuilt.ps1. The Baota Node project must already be stopped."
    & $DeployScript -ZipPath $finalZip -ChecksumPath $finalChecksum -Root $rootFull -Port $Port -KeepReleases $KeepReleases
    return
  }

  Write-Host "Stop the Baota Node project, then run:"
  Write-Host "powershell -NoProfile -ExecutionPolicy Bypass -File `"$DeployScript`" -ZipPath `"$finalZip`" -ChecksumPath `"$finalChecksum`" -Root `"$rootFull`" -Port $Port -KeepReleases $KeepReleases"
}

function Invoke-OssPullSelfTest {
  $vectorDate = "Thu, 05 Nov 2026 03:01:22 GMT"
  $vectorKey = "releases/latest.json"
  $authorization = Get-OssAuthorization "GET" $script:OssBucket $vectorKey "self-test-access-key-id" "self-test-secret" $vectorDate
  if ($authorization -ne "OSS self-test-access-key-id:6kIXVWEwOY93DCDg8GppXr+J5J4=") {
    throw "OSS V1 signature test vector mismatch."
  }

  $names = Get-ReleaseObjectNames "ABCDEF0123456789ABCDEF0123456789ABCDEF01"
  if ($names.CommitSha -ne "abcdef0123456789abcdef0123456789abcdef01") {
    throw "Commit SHA was not normalized."
  }
  if ($names.ZipKey -ne "releases/$($names.CommitSha)/$($names.ReleaseName).zip") {
    throw "Pull object key mismatch."
  }

  $pointer = [pscustomobject]@{
    schemaVersion = 1
    repository = $script:ReleaseRepository
    bucket = $script:OssBucket
    commitSha = $names.CommitSha
    releaseName = $names.ReleaseName
    zipKey = $names.ZipKey
    sha256Key = $names.Sha256Key
    sha256 = "ab" * 32
  }
  $checked = Assert-ReleasePointer $pointer $script:OssBucket
  if ($checked.ZipKey -ne $names.ZipKey) { throw "Pointer validation changed the zip key." }

  $evil = [pscustomobject]@{
    schemaVersion = 1
    repository = $script:ReleaseRepository
    bucket = $script:OssBucket
    commitSha = $names.CommitSha
    releaseName = $names.ReleaseName
    zipKey = "releases/../$($names.ReleaseName).zip"
    sha256Key = $names.Sha256Key
    sha256 = "ab" * 32
  }
  $rejected = $false
  try { Assert-ReleasePointer $evil $script:OssBucket | Out-Null } catch { $rejected = $true }
  if (-not $rejected) { throw "Path traversal in an OSS key was accepted." }

  $internal = Resolve-OssEndpoint $script:InternalEndpointHost
  if ($internal.Host -ne $script:InternalEndpointHost -or $internal.Scheme -ne "https") {
    throw "Internal endpoint did not resolve as HTTPS."
  }
  $public = Resolve-OssEndpoint "https://$($script:PublicEndpointHost)"
  if ($public.Host -ne $script:PublicEndpointHost) { throw "Public endpoint override was rejected." }
  $badEndpoint = $false
  try { Resolve-OssEndpoint "https://user:secret@$($script:PublicEndpointHost)" | Out-Null } catch { $badEndpoint = $true }
  if (-not $badEndpoint) { throw "Credentials embedded in the endpoint were accepted." }
  $httpEndpoint = $false
  try { Resolve-OssEndpoint "http://$($script:PublicEndpointHost)" | Out-Null } catch { $httpEndpoint = $true }
  if (-not $httpEndpoint) { throw "Plain HTTP production endpoint was accepted." }

  $virtual = Get-OssObjectUri $script:OssBucket $internal "releases/latest.json" "virtual"
  if ($virtual.AbsoluteUri -ne "https://$($script:OssBucket).$($script:InternalEndpointHost)/releases/latest.json") {
    throw "Virtual-hosted OSS URI mismatch: $($virtual.AbsoluteUri)"
  }

  $source = [System.IO.MemoryStream]::new([byte[]](1..100))
  $output = [System.IO.MemoryStream]::new()
  $limited = $false
  try { Copy-StreamLimited $source $output 10 | Out-Null } catch { $limited = $true }
  if (-not $limited) { throw "Download size limit was not enforced." }

  $tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("website-oss-env-" + [Guid]::NewGuid().ToString("n"))
  $saved = @{}
  foreach ($name in $script:CredentialNames) {
    $saved[$name] = [Environment]::GetEnvironmentVariable($name, "Process")
    Remove-Item -Path "Env:$name" -ErrorAction SilentlyContinue
  }
  try {
    $gitDir = Join-Path $tempRoot "repo"
    New-Item -ItemType Directory -Path (Join-Path $gitDir ".git") -Force | Out-Null
    $gitEnv = Join-Path $gitDir "oss.env"
    [System.IO.File]::WriteAllText($gitEnv, "ALIYUN_OSS_ACCESS_KEY_ID=from-git`n")
    $gitRejected = $false
    try { Import-OssCredentialFile $gitEnv } catch { $gitRejected = $true }
    if (-not $gitRejected) { throw "Credential file inside a Git work tree was read." }

    $serverDir = Join-Path $tempRoot "server"
    New-Item -ItemType Directory -Path $serverDir -Force | Out-Null
    $serverEnv = Join-Path $serverDir "oss.env"
    $envText = @(
      "# local only"
      "ALIYUN_OSS_ACCESS_KEY_ID=from-file"
      "ALIYUN_OSS_ACCESS_KEY_SECRET=`"secret=with=equals`""
      "ALIYUN_OSS_ENDPOINT=$($script:InternalEndpointHost)"
    ) -join "`n"
    [System.IO.File]::WriteAllText($serverEnv, $envText)
    $env:ALIYUN_OSS_ACCESS_KEY_ID = "from-process"
    Import-OssCredentialFile $serverEnv
    if ($env:ALIYUN_OSS_ACCESS_KEY_ID -ne "from-process") {
      throw "Process environment did not override the credential file."
    }
    if ($env:ALIYUN_OSS_ACCESS_KEY_SECRET -ne "secret=with=equals") {
      throw "Credential file value was not imported."
    }
    if ($env:ALIYUN_OSS_ENDPOINT -ne $script:InternalEndpointHost) {
      throw "Endpoint from the credential file was not imported."
    }
  }
  finally {
    foreach ($name in $script:CredentialNames) {
      Remove-Item -Path "Env:$name" -ErrorAction SilentlyContinue
      if (-not [string]::IsNullOrWhiteSpace($saved[$name])) {
        [Environment]::SetEnvironmentVariable($name, $saved[$name], "Process")
      }
    }
    if (Test-Path -LiteralPath $tempRoot) {
      Remove-Item -LiteralPath $tempRoot -Recurse -Force
    }
  }

  $tcp = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 0)
  $tcp.Start()
  $port = ([System.Net.IPEndPoint]$tcp.LocalEndpoint).Port
  $tcp.Stop()
  $prefix = "http://127.0.0.1:$port/"
  $ready = Join-Path ([System.IO.Path]::GetTempPath()) ("oss-ready-" + [Guid]::NewGuid().ToString("n"))
  $runspace = [runspacefactory]::CreateRunspace()
  $runspace.Open()
  $powershell = [powershell]::Create()
  $powershell.Runspace = $runspace
  $serverScript = @'
param($Prefix, $ReadyFile, $BodyText)
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add($Prefix)
$listener.Start()
[System.IO.File]::WriteAllText($ReadyFile, "ready")
$context = $listener.GetContext()
$captured = [pscustomobject]@{
  Authorization = $context.Request.Headers["Authorization"]
  Date = $context.Request.Headers["Date"]
  RawUrl = $context.Request.RawUrl
}
$bytes = [System.Text.Encoding]::UTF8.GetBytes($BodyText)
$context.Response.StatusCode = 200
$context.Response.ContentType = "text/plain"
$context.Response.ContentLength64 = $bytes.Length
$context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
$context.Response.OutputStream.Close()
$listener.Stop()
$captured
'@
  [void]$powershell.AddScript($serverScript).AddArgument($prefix).AddArgument($ready).AddArgument("payload-ok")
  $handle = $powershell.BeginInvoke()
  $destination = Join-Path ([System.IO.Path]::GetTempPath()) ("oss-body-" + [Guid]::NewGuid().ToString("n"))
  try {
    $deadline = [DateTime]::UtcNow.AddSeconds(10)
    while (-not (Test-Path -LiteralPath $ready)) {
      if ([DateTime]::UtcNow -gt $deadline) { throw "Loopback OSS listener did not start." }
      Start-Sleep -Milliseconds 50
    }
    Receive-OssObject $script:OssBucket $prefix.TrimEnd("/") $vectorKey $destination "self-test-access-key-id" "self-test-secret" $vectorDate -AllowLoopback -MaxBytes 1024
    if ([System.IO.File]::ReadAllText($destination) -ne "payload-ok") {
      throw "Loopback download body mismatch."
    }
    if (-not $handle.AsyncWaitHandle.WaitOne(20000)) {
      throw "Loopback OSS listener timed out."
    }
    $result = $powershell.EndInvoke($handle)
    if ($powershell.Streams.Error.Count -gt 0) {
      throw "Loopback OSS listener failed."
    }
    $row = $result[0]
    if ($row.Authorization -ne $authorization) {
      throw "Authorization header was not the OSS V1 signature."
    }
    if ($row.Date -ne $vectorDate) {
      throw "Date header was not sent exactly."
    }
    if ($row.RawUrl -ne "/$($script:OssBucket)/$vectorKey") {
      throw "Unexpected OSS request path."
    }
  }
  finally {
    if (-not $handle.IsCompleted) {
      $powershell.Stop()
    }
    $powershell.Dispose()
    $runspace.Dispose()
    Remove-Item -LiteralPath $ready, $destination -Force -ErrorAction SilentlyContinue
  }

  Write-Host "OSS pull self-test passed."
}

if ($SelfTest) {
  Invoke-OssPullSelfTest
  return
}

Invoke-OssPull
