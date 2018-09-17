const router = require('koa-router')()
const ajvValidator = require('../lib/middlewares/ajv')
const wxauthCtrl = require('../lib/controllers/wxauth')

router.get('/code', async (ctx, next) => {
    await wxauthCtrl.getAccessTokenAPI(ctx, next)
  }
)

module.exports = router
