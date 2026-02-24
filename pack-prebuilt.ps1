$ErrorActionPreference = "Stop"

Set-Location -Path "E:\website"

npm install
npm -w apps/website run build

$stamp = Get-Date -Format "yyyyMMdd-HHmm"
$stage = "dist\prebuilt-$stamp"
$out   = "dist\prebuilt-$stamp.zip"

if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
New-Item -ItemType Directory -Force -Path $stage | Out-Null

# Copy runtime files. IMPORTANT: include content/ (blog posts).
robocopy . $stage /E /XD .git node_modules .next\cache /XF *.log | Out-Null

if (Test-Path $out) { Remove-Item $out -Force }
Compress-Archive -Path "$stage\*" -DestinationPath $out -Force

Write-Host "Wrote: $out"
