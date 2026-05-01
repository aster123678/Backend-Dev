param(
  [string]$ReleaseRoot = "C:\inetpub\wwwroot\releases",
  [string]$CurrentLink = "C:\inetpub\wwwroot\enterprise-transactions",
  [string]$PreviousRelease
)

$ErrorActionPreference = "Stop"
if (-not $PreviousRelease) {
  $PreviousRelease = Get-ChildItem $ReleaseRoot -Directory | Sort-Object LastWriteTime -Descending | Select-Object -Skip 1 -First 1 -ExpandProperty FullName
}

if (-not (Test-Path $PreviousRelease)) {
  throw "Previous release not found."
}

Copy-Item -Path "$PreviousRelease\*" -Destination $CurrentLink -Recurse -Force
iisreset /restart
Invoke-RestMethod -Uri "https://transactions.company.com/health"

