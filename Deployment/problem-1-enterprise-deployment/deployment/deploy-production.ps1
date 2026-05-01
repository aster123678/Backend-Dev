param(
  [string]$SitePath = "C:\inetpub\wwwroot\enterprise-transactions",
  [string]$ArtifactPath = ".\release.zip"
)

$ErrorActionPreference = "Stop"
$now = Get-Date
$isWeekend = $now.DayOfWeek -in @("Saturday", "Sunday")
$inWindow = $now.Hour -ge 2 -and $now.Hour -lt 6
if (-not ($isWeekend -and $inWindow)) {
  throw "Production deployments are allowed only during weekend maintenance windows from 02:00 to 06:00."
}

Write-Host "Verify QA sign-off and change ticket before continuing."
Expand-Archive -Path $ArtifactPath -DestinationPath $SitePath -Force
npm --prefix $SitePath install --production
iisreset /restart
Invoke-RestMethod -Uri "https://transactions.company.com/health"

