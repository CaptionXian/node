// const db = require('limbo').use('hospital')
const { Base } = require('./base')
const config = require('config')
const axios = require('../utils/axios')

class WxauthCtrl extends Base {
    
    // 微信获取token
    async getAccessTokenAPI (ctx, next) {
        const app_id = config.WECHAT.APP_ID
        const app_secret = config.WECHAT.APP_SECRET
        const code = ctx.query.code
        console.log("code",code)

        const wx_auth_url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${app_id}&secret=${app_secret}&code=${code}&grant_type=authorization_code`
        const data = await axios.axios_get(wx_auth_url)
        console.log("data",data)
        const access_token = data.access_token
        const openid = data.openid

        const user_url = `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}&lang=zh_CN`
        const user = await axios.axios_get(user_url)
        console.log("user",user)
        // ctx.body = JSON.parse(user)
    }
}

module.exports = new WxauthCtrl()