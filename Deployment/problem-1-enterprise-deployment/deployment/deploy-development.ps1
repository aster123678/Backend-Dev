param([string]$AppName = "enterprise-transactions-dev")

$ErrorActionPreference = "Stop"
heroku config:set APP_ENV=development NODE_ENV=development LOG_LEVEL=debug AUDIT_LOG_ENABLED=true --app $AppName
git push https://git.heroku.com/$AppName.git HEAD:main
heroku ps:scale web=1 --app $AppName
heroku run "node -e `"fetch('https://$AppName.herokuapp.com/health').then(r=>console.log(r.status))`"" --app $AppName

