param([string]$AppName = "peak-ecommerce-platform")

$ErrorActionPreference = "Stop"
heroku ps:scale web=10:Performance-L worker=4:Performance-M --app $AppName
heroku config:set PEAK_MODE=false CACHE_TTL_SECONDS=120 --app $AppName
Write-Host "After validation, scale MongoDB Atlas M80 back to M60 and keep post-peak snapshot."

