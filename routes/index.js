const router = require('koa-router')()
const ajvValidator = require('../lib/middlewares/ajv')
const userCtrl = require('../lib/controllers/user')

router.get('/', async (ctx, next) => {
  ctx.body = 'version 0.1.0'
  }
)

router.get('/code', async (ctx, next) => {
    await userCtrl.getAccessTokenAPI(ctx, next)
  }
)

module.exports = router
