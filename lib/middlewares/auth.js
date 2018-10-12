const db = require('limbo').use('hospital')
const config = require('config')
const jwt = require('jsonwebtoken')
const unless = require('koa-unless')
const createErr = require('http-errors')

const auth = {}

auth.authMiddleware = async (ctx, next) => {
    let user
    const token = ctx.header.authorization
    if(token) {
        try {
            user = await jwt.verify(token.split(' ')[1], config.AUTH.SECRET)
            console.log("aaaaa",user)
            const dbToken = (await db.user.findOne({ _id: user._id, isDeleted: false })).token
            console.log("token",token)
            console.log("dbToken",dbToken)
            if(token !== `Bearer ${dbToken}`){
                throw createErr(401, 'token错误')
            }
            ctx.state.user = user
            await next()
        } catch (error) {
            throw createErr(401, 'token错误')
        }
    } else {
        throw createErr(401, 'token错误')
    }
}

auth.authMiddleware.unless = unless
module.exports = auth