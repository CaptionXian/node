const router = require('koa-router')()

router.get('/', async (ctx, next) => {
  ctx.body = 'version 0.1.0'
}
)

module.exports = router
