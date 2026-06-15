# Deploy Backend SIGAP ke Heroku

```bash
heroku login
cd D:\SIGAP\backend
heroku create sigap-backend-rahmat
heroku config:set DB_HOST=acela.proxy.rlwy.net
heroku config:set DB_PORT=48869
heroku config:set DB_NAME=sigap_mobile
heroku config:set DB_USER=root
heroku config:set DB_PASSWORD=<PASSWORD_RAILWAY>
heroku config:set NODE_ENV=production
git add .
git commit -m "prepare backend for heroku deploy"
git push heroku main
heroku ps:scale web=1
heroku logs --tail
```
