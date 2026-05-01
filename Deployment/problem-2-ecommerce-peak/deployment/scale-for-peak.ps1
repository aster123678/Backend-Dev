param([string]$AppName = "peak-ecommerce-platform")

$ErrorActionPreference = "Stop"
heroku ps:scale web=10:Performance-L worker=4:Performance-M --app $AppName
heroku config:set PEAK_MODE=true CACHE_TTL_SECONDS=300 --app $AppName
heroku addons:upgrade heroku-redis:premium-7 --app $AppName
Write-Host "Scale MongoDB Atlas M60 to M80 from Atlas UI/API before opening peak traffic."
heroku releases --app $AppName

