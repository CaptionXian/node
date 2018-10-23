const db = require('limbo').use('hospital')
const config = require('config')
const jwt = require('jsonwebtoken')
const unless = require('koa-unless')
const createErr = require('http-errors')

const auth = {}

auth.authMiddleware = async (ctx, next) => {
    let user
    let token = ctx.header.authorization
    if(!token) token = ctx.query.token
    if(token) {
        try {
            user = await jwt.verify(token.split(' ')[1], config.AUTH.SECRET)
        } catch (error) {
            throw createErr(401, 'token错误')
        }
        const dbToken = (await db.user.findOne({ _id: user._id, isDeleted: false })).token
        if(token !== `Bearer ${dbToken}`){
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