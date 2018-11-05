const db = require('limbo').use('hospital')
const { Base } = require('./base')
const config = require('config')
const axios = require('../utils/axios')
const _ = require('lodash')
const createErr = require('http-errors')
const his = require('../services/his')

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

    if (auth_result.data.errcode === 40163) {
      ctx.body = {}
    }

    const user_url = `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}&lang=zh_CN`
    const user = await axios.axios_get(user_url)

    const isExist = await db.wxuser.findOne({ 'openid': user.data.openid })

    if (_.isEmpty(isExist)) {
      ctx.body = await db.wxuser.create(user.data)
    } else {
      const data = _.assign({}, user.data, { 'updated': new Date() })
      ctx.body = await db.wxuser.findOneAndUpdate(
        { 'openid': user.data.openid },
        data,
        { upsert: true, new: true }
      )
    }
  }

  // 提交问卷
  async submitQuestionnaireAPI (ctx, next) {
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
  async getQuestionnaireAPI (ctx, next) {
    const { userId, type } = ctx.state.params
    let conds = {}
    if (userId) conds.userId = userId
    if (type) conds.type = type

    ctx.body = await db.questionnaire.find(conds)
  }

  //  提交病历复印
  async submitMedicalRecordCopyAPI (ctx, next) {
    const { userId, name, tel, address, note } = ctx.state.params
    const data = _.omitBy({
      name,
      tel,
      address,
      note
    },
    _.isUndefined
    )
    ctx.body = await db.record.create(data)
  }

  //  患者信息查询
  async getPatientInformation(ctx, next) {
    const { 
      BussAcctType, 
      AccountNo, 
      date, 
      Time, 
      Tel, 
      Name
    } = ctx.state.params
    const data = 
      `<![CDATA[
        <HisTrans>
        <TranCode>IsExistAccount</TranCode>
        <FtyCode>DM01</FtyCode>
        <DevNo></DevNo>
        <DevSeqNo></DevSeqNo>
        <Date>${ date }</Date>
        <Time>${ Time }</Time>
        <BussAcctType>${ BussAcctType }</BussAcctType>
        <AccountNo>${ AccountNo }</AccountNo>
        <Tel>${ Tel }</Tel>
        <Name>${ Name }</Name>
        </HisTrans>
      ]]>`
    ctx.body = await his.handleXml(data)
  }

  //  绑卡
  async userTieCardAPI(ctx, next) {
    await this.validateHisAccount(ctx)
    const { userId, hisID, healthNo } = ctx.state.params
    const data = _.omitBy(
      {
        hisID,
        healthNo,
        lastLoginTime: new Date
      },
      _.isUndefined
    )

    

    ctx.body = await db.wxuser.findOneAndUpdate(
      { '_id': userId },
      { hisAccount: data },
      { upsert: true, new: true }
    )
  }

   //  HIS账号校验
   async validateHisAccount (ctx) {
    const { userId, healthNo } = ctx.state.params
    const accounts = await db.wxuser.findOne({ '_id': userId }, { hisAccount: 1 }).lean()
    console.log("Aaaaa",accounts)
    for (let account of accounts) {
      if(account.healthNo === healthNo){
        throw createErr(400, '该卡已绑定')
      }
    }
  }

}

module.exports = new UserCtrl()
