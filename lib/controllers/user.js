const db = require('limbo').use('hospital')
const { Base } = require('./base')
const config = require('config')
const axios = require('../utils/axios')
const _ = require('lodash')
const createErr = require('http-errors')
const xmlUtil = require('../services/xml')

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
      ctx.body = await db.wxuser.create(user.data).lean()
    } else {
      const data = _.assign({}, user.data, { 'updated': new Date() })
      ctx.body = await db.wxuser.findOneAndUpdate(
        { 'openid': user.data.openid },
        data,
        { upsert: true, new: true }
      ).lean()
    }
    await this.setWithHisAccountMsg(ctx)
  }

  //  附带His账号信息
  async setWithHisAccountMsg(ctx) {
    let result = ctx.body.hisAccount
    if (!Array.isArray(result)) {
      result = [result]
    }
    for(let account of result) {
      const data = 
        `<![CDATA[
          <HisTrans>
          <TranCode>IsExistAccount</TranCode>
          <FtyCode>DM01</FtyCode>
          <DevNo></DevNo>
          <DevSeqNo></DevSeqNo>
          <Date></Date>
          <Time></Time>
          <BussAcctType>1</BussAcctType>
          <AccountNo>${ account.healthNo }</AccountNo>
          <Tel></Tel>
          <Name></Name>
          </HisTrans>
        ]]>`
      const accountMsg = await xmlUtil.handleXml(data)
      _.assign(account, accountMsg)
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
    ctx.body = await xmlUtil.handleXml(data)
  }

  //  绑卡
  async userTieCardAPI(ctx, next) {
    await this.validateHisAccount(ctx)
    const { userId, hisID, healthNo, type } = ctx.state.params

    let accounts = await db.wxuser.findOne({ '_id': userId }, { hisAccount: 1 }).lean()
    if(type) {      
      accounts.hisAccount.push({
        hisID,
        healthNo,
        lastLoginTime: new Date()
      })
    } else {
      _.dropWhile(accounts.hisAccount, function(o) {
        return o.HisID !== hisID
      })
    }
    console.log("Aaaa",accounts.hisAccount)
    ctx.body = await db.wxuser.findOneAndUpdate(
      { '_id': userId },
      { hisAccount: accounts.hisAccount },
      { upsert: true, new: true }
    )
  }

  //  获取科室信息
  async getDepartments(ctx) {

  }

   //  HIS账号校验
   async validateHisAccount(ctx) {
    const { userId, healthNo, type } = ctx.state.params
    if(!type){
      return
    }
    const accounts = await db.wxuser.findOne({ '_id': userId }, { hisAccount: 1 }).lean()
    for (let account of accounts.hisAccount) {
      if(account.healthNo === healthNo){
        throw createErr(400, '该卡已绑定')
      }
    }
  }
  
  //  生成指定长度的随机数
  async get_nonce_str(len){
    let str = ''
    while(str.length < len){
        str +=  Math.random().toString(36).slice(2)
    }
    return str.slice(-len)
  }

  //  预交金充值
  async rechargeHisAccountAPI(ctx, next) {
    const { userId, hisID, total_fee, openid, sign } = ctx.state.params
    const data = _.omitBy(
      {
        userId,
        hisID,
        openid,
        total_fee
      },
      _.isUndefined
    )
    const arr = Object.keys(data).sort().map(item => {
      return `${item}=${data[item]}`
    })
    const str = arr.join('&')
    const signStr = await this.getSign(str)
    if(signStr !== sign) throw createErr(400, '签名错误')

    const order = await db.order.create(data)

    let obj = {
      appid: config.WECHAT.APP_ID,
      mch_id: config.WECHAT.MCH_ID,
      nonce_str: await this.get_nonce_str(32),
      body: '预交金充值',
      out_trade_no: order._id,
      total_fee: parseInt(total_fee * 100),
      spbill_create_ip: ctx.ip.slice(7),
      notify_url: config.WECHAT.NOTIFY_URL,
      trade_type:'JSAPI',
      attach: hisID,
      openid
    }

    const rechargeArr = Object.keys(obj).sort().map(item => {
      return `${item}=${obj[item]}`
    })
    const rechargeStr = rechargeArr.join('&') + '&key=' + config.WECHAT.KEY
    obj.sign = await this.getSign(rechargeStr)

    let res
    try{
      // 调用微信统一下单接口拿到 prepay_id
      res = await this.wechatPay(obj)
      const { prepay_id } = res
      if(prepay_id){
          res = await this.getClientPayConfig(prepay_id)
      }
    }catch(err){
        console.log(err)
    }
    
    ctx.body = res
  }

  // 支付结果通知
  async payNotifyAPI(ctx, next) {
    const data = ctx.params
    let payQuery = {
      appid: data.xml.appid[0],
      mch_id: data.xml.mch_id[0],
      nonce_str: data.xml.nonce_str[0],
      out_trade_no: data.xml.out_trade_no[0],
      attach: data.xml.attach[0],
    }
    const payQueryArr = Object.keys(payQuery).sort().map(item => {
      return `${item}=${obj[item]}`
    })
    const payQueryStr = payQueryArr.join('&') + '&key=' + config.WECHAT.KEY
    payQuery.sign = await this.getSign(payQueryStr)

    const result = await this.wechatPayResult(payQuery)    
    //  查询支付结果
    console.log("aaaaaaa",result)

    //  告知微信已收到，并调 HIS 接口充值
    if (result.xml.return_code[0] && result.xml.return_code[0] == 'SUCCESS' && result.xml.trade_state[0] == 'SUCCESS' ) {

      const ChargeAmt = (await db.order.find({ '_id': out_trade_no })).total_fee
      const data = 
      `<![CDATA[
        <HisTrans>
        <TranCode>ChargeToClinicCard</TranCode>
        <FtyCode>DM01</FtyCode>
        <DevNo></DevNo>
        <DevSeqNo></DevSeqNo>
        <Date>${ date }</Date>
        <Time>${ Time }</Time>
        <HisID>${ payQuery.attach }</HisID>
        <ChargeAmt>${ ChargeAmt }</ChargeAmt>
        <ChargeType>3</ChargeType>
        <BankCardNo></BankCardNo>
        <BankSeqNo></BankSeqNo>
        <ChargeSource>0</ChargeSource>
        </HisTrans>
      ]]>`
      await xmlUtil.handleXml(data)

      const resXml = "<xml>" + "<return_code><![CDATA[SUCCESS]]></return_code>" + 
      "<return_msg><![CDATA[OK]]></return_msg>" + "</xml> "
      ctx.body = { resXml }
    }
  }

  //  MD5加密
  async getSign (str) {
    console.log(str)
    let hash = crypto.createHash('md5').update(str,'utf8')
    return hash.digest('hex').toUpperCase()
  }

  async getClientPayConfig(prepay_id) {
    let obj = {
        appId: appid,
        timeStamp: String(Math.floor(Date.now()/1000)),
        nonceStr: await this.get_nonce_str(32),
        package: 'prepay_id=' + prepay_id,
        signType: 'MD5'
    }
    const arr = Object.keys(obj).sort().map(item => {
        return `${item}=${obj[item]}`
    })
    const str = arr.join('&') + '&key=' + config.WECHAT.KEY
    obj.paySign = getSign(str)
    return obj
  }

  async wechatPay(obj) {
    const xml = xmlUtil.json2xml(obj)
    console.log(xml)
    const result = await axios.axios_post(
      config.WECHAT.PREPAY_URL,
      xml
    )
    console.log(xmlUtil.parseXml(result))
  }

  async wechatPayResult(obj) {
    const xml = xmlUtil.json2xml(obj)
    console.log(xml)
    const result = await axios.axios_post(
      config.WECHAT.ORDERQUERY_URL,
      xml
    )
    console.log(xmlUtil.parseXml(result))
  }

}

module.exports = new UserCtrl()
