param([string]$AppName = "enterprise-transactions-staging")

$ErrorActionPreference = "Stop"
Write-Host "Requires approved pull request before deployment."
heroku config:set APP_ENV=staging NODE_ENV=staging LOG_LEVEL=info AUDIT_LOG_ENABLED=true --app $AppName
git push https://git.heroku.com/$AppName.git HEAD:main
heroku ps:scale web=2 --app $AppName
heroku logs --tail --app $AppName

