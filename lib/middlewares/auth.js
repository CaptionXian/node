const db = require('limbo').use('hospital')
const config = require('config')
const jwt = require('jsonwebtoken')
const unless = require('koa-unless')
const createErr = require('http-errors')

const auth = {}

auth.authMiddleware = async (ctx, next) => {
  let user, dbToken
  let token = ctx.header.authorization
  if (!token) token = `Bearer ${ctx.request.query.token}`
  if (token) {
    try {
      user = await jwt.verify(token.split(' ')[1], config.AUTH.SECRET)
      dbToken = (await db.user.findOne({ _id: user._id, isDeleted: false })).token
    } catch (error) {
      throw createErr(401, 'token错误')
    }
    if (token !== `Bearer ${dbToken}`) {
      throw createErr(401, 'token错误')
    }
    ctx.state.user = user
    await next()
  } else {
    throw createErr(401, 'token错误')
  }
}

auth.authMiddleware.unless = unless
module.exports = auth
