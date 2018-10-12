const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const cors = require('koa2-cors')

// mongo
require('./lib/services/mongo')

const { authMiddleware } = require('./lib/middlewares/auth')
const index = require('./routes/index')
const users = require('./routes/users')
const hospital = require('./routes/hospital')

// error handler
onerror(app)

app.use(
  cors()
)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text', 'xml']
}))
app.use(json())
app.use(logger())

//设置静态资源的路径 
app.use(require('koa-static')(__dirname + '/public/uploads'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// auth
app.use(authMiddleware.unless({
  path: [
    '/hospital/login', '/hospital/exportExcel', '/hospital/summary', '/hospital/schedule', '/hospital/news', '/hospital/banner', '/hospital/department',
    '/hospital/doctor', '/hospital/department/:_id/doctor', '/hospital/wellness', '/hospital/partybuilding', '/hospital/*', '/user/*',
  ]
}))

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
app.use(hospital.routes(), hospital.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
