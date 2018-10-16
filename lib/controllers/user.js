const db = require('limbo').use('hospital')
const { Base } = require('./base')
const config = require('config')
const axios = require('../utils/axios')
const _ = require('lodash')
const createErr = require('http-errors')

class UserCtrl extends Base {
    
    // 微信获取token
    async getAccessTokenAPI (ctx, next) {
        const app_id = config.WECHAT.APP_ID
        const app_secret = config.WECHAT.APP_SECRET
        const code = ctx.query.code

        const wx_auth_url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${app_id}&secret=${app_secret}&code=${code}&grant_type=authorization_code`
        const auth_result = await axios.axios_get(wx_auth_url)
        const access_token = auth_result.data.access_token
        const openid = auth_result.data.openid

        const user_url = `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}&lang=zh_CN`

        console.log("aaaa",openid)
        console.log("code",code)

        const user = await axios.axios_get(user_url)
        if(!_.isUndefined(user.data.errcode)){
            ctx.body = {}
        }
        ctx.body = await db.wxuser.findOneAndUpdate(
            { 'openid' : user.data.openid },
            user.data,
            { upsert: true, new: true }
            )
    }

    // 提交问卷
    async submitQuestionnaireAPI(ctx, next) {
        const {
            userId,
            name,
            date,
            tel,
            type,
            answer,
            advantage,
            defect
        } = ctx.state.params

        const data = {
            userId,
            name,
            date,
            tel,
            type,
            answer,
            advantage,
            defect
        }

        ctx.body = await db.questionnaire.create(data)
    }

    // 获取问卷
    async getQuestionnaireAPI(ctx, next) {
        const { userId, type } = ctx.state.params
        let conds = {}
        if(userId) conds.userId = userId
        if(type) conds.type = type

        ctx.body = await db.questionnaire.find(conds)
    }
}

module.exports = new UserCtrl()