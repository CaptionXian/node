const db = require('limbo').use('hospital')
const { Base } = require('./base')
const config = require('config')
const axios = require('../utils/axios')
const _ = require('lodash')
const createErr = require('http-errors')
const xmlUtil = require('../services/xml')
const moment = require('moment')
const jsonify = require('../utils/jsonify')
const crypto = require('crypto')

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

    await jsonify(ctx)
    await this.setWithHisAccountMsg(ctx)
  }

  //  附带His账号信息
  async setWithHisAccountMsg(ctx) {
    let result = ctx.body.hisAccount
    if (!Array.isArray(result)) {
      result = [result]
    }
    const last = Math.max.apply(Math, result.map(function(o) {return o.lastLoginTime}))
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
          <AccountNo>${ account.healthNo.slice(4) }</AccountNo>
          <Tel></Tel>
          <Name></Name>
          </HisTrans>
        ]]>`
      const accountMsg = await xmlUtil.handleXml(data)
      _.assign(account, accountMsg)
      if(moment(account.lastLoginTime).valueOf() === last)account.lastIndex = true
    }
  }

  //  登录His账号
  async loginHisAccountAPI(ctx) {
    const { userId, healthNo } = ctx.state.params

    let accounts = await db.wxuser.findOne({ '_id': userId }, { hisAccount: 1 })
    
    for(let account of accounts.hisAccount) {
      if(account.healthNo === healthNo){
        account.lastLoginTime = new Date()
      }
    }

    ctx.body = await db.wxuser.findOneAndUpdate(
      { '_id': userId },
      { hisAccount: accounts.hisAccount },
      { upsert: true, new: true }
    )
    
    await jsonify(ctx)
    await this.setWithHisAccountMsg(ctx)
  }

  //  提交问卷
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

  //  获取问卷
  async getQuestionnaireAPI(ctx, next) {
    const { userId, type } = ctx.state.params
    let conds = {}
    if (userId) conds.userId = userId
    if (type) conds.type = type

    ctx.body = await db.questionnaire.find(conds)
  }

  //  提交病历复印
  async submitMedicalRecordCopyAPI(ctx, next) {
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

  //  患者无卡建档
  async registrationArchivesAPI(ctx) {
    const { 
      Nation, 
      IDCardNo, 
      Sex,
      Name
    } = ctx.state.params
    const data = 
      `<![CDATA[
        <HisTrans>
        <TranCode>RegistrationArchives</TranCode>
        <FtyCode>DM01</FtyCode>
        <DevNo></DevNo>
        <DevSeqNo></DevSeqNo>
        <Date></Date>
        <Time></Time>
        <Name>${ Name }</Name>
        <SEX>${ Sex }</SEX>
        <Birthday></Birthday>
        <IDCardNo>${ IDCardNo }</IDCardNo>
        <Nation>${ Nation }</Nation>
        </HisTrans>
      ]]>`
    ctx.body = await xmlUtil.handleXml(data, false)
  }

  //  患者信息查询
  async getPatientInformationAPI(ctx, next) {
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

  //  绑卡/解绑
  async userTieCardAPI(ctx, next) {
    await this.validateHisAccount(ctx)
    const { userId, HisID, type } = ctx.state.params
    let healthNo = _.padStart(ctx.state.params.healthNo, 12, '0')

    let accounts = await db.wxuser.findOne({ '_id': userId }, { hisAccount: 1 })
    if(type) {      
      accounts.hisAccount.push({
        HisID,
        healthNo,
        lastLoginTime: new Date()
      })
    } else {
      accounts.hisAccount = _.remove(accounts.hisAccount, function(n) {
        return n.healthNo !== healthNo
      })
    }
    
    ctx.body = await db.wxuser.findOneAndUpdate(
      { '_id': userId },
      { hisAccount: accounts.hisAccount },
      { upsert: true, new: true }
    )

    await jsonify(ctx)
    await this.setWithHisAccountMsg(ctx)
  }

  //  获取科室信息
  async getDepartmentsAPI(ctx) {
    const { SuperDeptId, date, Time } = ctx.state.params
    const data = 
      `<![CDATA[
        <HisTrans>
        <TranCode>GetDepts</TranCode>
        <SuperDeptId>${ SuperDeptId }</SuperDeptId>
        <DevNo></DevNo>
        <DevSeqNo></DevSeqNo>
        <Date>${ date }</Date>
        <Time>${ Time }</Time>
        </HisTrans>
      ]]>`
    ctx.body = await xmlUtil.handleXml(data, false)
  }

  //  获取医生信息
  async getDoctorsAPI(ctx) {
    const { DeptId, DoctorName, QueryDate, QueryEndDate, QueryTime, date, Time } = ctx.state.params
    const data = 
      `<![CDATA[
        <HisTrans>
        <TranCode>GetDoctors</TranCode>
        <DeptId>${ DeptId }</DeptId>
        <DoctorName>${ DoctorName ? DoctorName : '' }</DoctorName>
        <QueryDate>${ moment().add(1,'d').format('YYYYMMDD') }</QueryDate>
        <QueryEndDate>${ moment().add(3,'d').format('YYYYMMDD') }</QueryEndDate>
        <QueryTime>${ QueryTime }</QueryTime>
        <Type></Type>
        <DevNo></DevNo>
        <DevSeqNo></DevSeqNo>
        <Date>${ date ? date : '' }</Date>
        <Time>${ Time ? Time : '' }</Time>
        </HisTrans>
      ]]>`
    ctx.body = await xmlUtil.handleXml(data, false)
    
    if(ctx.body.RespCode === '0000')await this.setWithDoctorWorkDate(ctx)
  }

  //  获取医生排班和可预约总数信息
  async setWithDoctorWorkDate(ctx) {
    const { DeptId, QueryDate, date, Time } = ctx.state.params
    let result = ctx.body.Doctors.Doctor
    if (!Array.isArray(result)) {
      result = [result]
    }
    for (let doctor of result) {
      const data = 
      `<![CDATA[
        <HisTrans>
        <TranCode>GetDoctorWorkDate</TranCode>
        <DeptId>${ DeptId }</DeptId>
        <DoctorId>${ doctor.Id }</DoctorId>
        <QueryDate>${ moment().add(1,'d').format('YYYYMMDD') }</QueryDate>
        <DevNo></DevNo>
        <DevSeqNo></DevSeqNo>
        <Date>${ date ? date : '' }</Date>
        <Time>${ Time ? Time : '' }</Time>
        </HisTrans>
      ]]>`
      doctor.Count = (await xmlUtil.handleXml(data, false)).Count
      doctor.WorkDate = (await xmlUtil.handleXml(data, false)).WorkDates.WorkDate
    }
  }

  // 获取医生号源信息
  async getOrderSourceAPI(ctx) {
    const { DeptId, DoctorId, QueryDate, QueryTime, IsAllYY, date, Time } = ctx.state.params
    const data = 
      `<![CDATA[
        <HisTrans>
        <TranCode>GetOrderSource</TranCode>
        <DeptId>${ DeptId }</DeptId>
        <DoctorId>${ DoctorId }</DoctorId>
        <QueryDate>${ moment(QueryDate).format('YYYYMMDD') }</QueryDate>
        <QueryTime>${ QueryTime ? QueryTime : '' }</QueryTime>
        <IsAllYY>${ IsAllYY ? IsAllYY : '' }</IsAllYY>
        <DevNo></DevNo>
        <DevSeqNo></DevSeqNo>
        <Date>${ date ? date : '' }</Date>
        <Time>${ Time ? Time : '' }</Time>
        </HisTrans>
      ]]>`
    ctx.body = await xmlUtil.handleXml(data, false)
  }

  //  号源预约
  async regOrderAPI(ctx) {
    const { HisID, DeptId, DoctorId, OrderDate, OrderTime, OrderID, Tel, date, Time } = ctx.state.params
    //  先锁定号源
    const data = 
    `<![CDATA[
      <HisTrans>
      <TranCode>LockOrder</TranCode>
      <HisID>${ HisID }</HisID>
      <DeptId>${ DeptId }</DeptId>
      <DoctorId>${ DoctorId }</DoctorId>
      <OrderDate>${ OrderDate ? moment(OrderDate).format('YYYYMMDD') : '' }</OrderDate>
      <OrderTime>${ OrderTime ? OrderTime : '' }</OrderTime>
      <OrderID>${ OrderID }</OrderID>
      <DevNo></DevNo>
      <DevSeqNo></DevSeqNo>
      <Date>${ date ? date : '' }</Date>
      <Time>${ Time ? Time : '' }</Time>
      </HisTrans>
    ]]>`
    const lockResult = await xmlUtil.handleXml(data, false)

    //  再执行号源预约
    if( lockResult.HisSeqNo ) {
      const data = 
      `<![CDATA[
        <HisTrans>
        <TranCode>RegOrder</TranCode>
        <HisID>${ HisID }</HisID>
        <DeptId>${ DeptId }</DeptId>
        <DoctorId>${ DoctorId }</DoctorId>
        <OrderDate>${ OrderDate ? moment(OrderDate).format('YYYYMMDD') : '' }</OrderDate>
        <OrderTime>${ OrderTime ? OrderTime : '' }</OrderTime>
        <laiyuan>2</laiyuan>
        <OrderID>${ OrderID }</OrderID>
        <Tel>${ Tel ? Tel : '' }</Tel>
        <DevNo></DevNo>
        <DevSeqNo></DevSeqNo>
        <Date>${ date ? date : '' }</Date>
        <Time>${ Time ? Time : '' }</Time>
        </HisTrans>
      ]]>`
      ctx.body = await xmlUtil.handleXml(data, false)

    } else {
      ctx.body = lockResult
    }
  }

  //  获取预约号源信息
  async getOrderMsgAPI(ctx) {
    const { HisID, ZIKESHIID, date, Time } = ctx.state.params
    const data = 
      `<![CDATA[
        <HisTrans>
        <TranCode>GetOrderInfo</TranCode>
        <HisID>${ HisID }</HisID>
        <ZIKESHIID>${ ZIKESHIID ? ZIKESHIID : '' }</ZIKESHIID>
        <DevNo></DevNo>
        <DevSeqNo></DevSeqNo>
        <Date>${ date ? date : '' }</Date>
        <Time>${ Time ? Time : '' }</Time>
        </HisTrans>
      ]]>`

    ctx.body = await xmlUtil.handleXml(data, false)
  }

  //  取消预约
  async cancleOrderAPI(ctx) {
    const { HisID, OrderNumber, HisSeqNo, date, Time } = ctx.state.params
    const data = 
      `<![CDATA[
        <HisTrans>
        <TranCode>CancleOrder</TranCode>
        <HisID>${ HisID }</HisID>
        <OrderNumber>${ OrderNumber }</OrderNumber>
        <HisSeqNo>${ HisSeqNo }</HisSeqNo>
        <DevNo></DevNo>
        <ISQUYIYUAN></ISQUYIYUAN>
        <DevSeqNo></DevSeqNo>
        <Date>${ date ? date : '' }</Date>
        <Time>${ Time ? Time : '' }</Time>
        </HisTrans>
      ]]>`

    ctx.body = await xmlUtil.handleXml(data, false)
  }

  //  预约签到
  async conFirmOrderAPI(ctx) {
    const { CardNo, HisSeqNo, date, Time } = ctx.state.params
    const data = 
      `<![CDATA[
        <HisTrans>
        <TranCode>ConfirmOrder</TranCode>
        <CardNo>${ CardNo }</CardNo>
        <HisSeqNo>${ HisSeqNo }</HisSeqNo>
        <DevNo></DevNo>
        <DevSeqNo></DevSeqNo>
        <Date>${ date ? date : '' }</Date>
        <Time>${ Time ? Time : '' }</Time>
        </HisTrans>
      ]]>`

    ctx.body = await xmlUtil.handleXml(data, false, 'Orders')
  }

  //  检验报告单列表
  async getReportProgresssAPI(ctx) {
    const { 
      HealthNo, 
      IDCardNo, 
      QueryType,
      QueryMode,
      QueryBeginDate,
      QueryEndDate,
      ReportID
    } = ctx.state.params
    const data = 
      `<![CDATA[
        <HisTrans>
        <TranCode>GetReportProgresss</TranCode>
        <FtyCode>DM01</FtyCode>
        <DevNo></DevNo>
        <DevSeqNo></DevSeqNo>
        <Date></Date>
        <Time></Time>
        <HealthNo >${ HealthNo }</HealthNo >
        <IDcardNo >${ IDCardNo ? IDCardNo : '' }</IDcardNo >
        <QueryType>${ QueryType }</QueryType>
        <QueryMode>${ QueryMode ? QueryMode : '' }</QueryMode>
        <QueryBeginDate>${ QueryBeginDate ? QueryBeginDate : '' }</QueryBeginDate>
        <QueryEndDate>${ QueryEndDate ? QueryEndDate : '' }</QueryEndDate>
        <ReportID>${ ReportID ? ReportID : '' }</ReportID>
        </HisTrans>
      ]]>`
    ctx.body = await xmlUtil.handleXml(data, false)
  }

  //  HIS账号校验
  async validateHisAccount(ctx) {
    const { userId, type } = ctx.state.params
    let healthNo = _.padStart(ctx.state.params.healthNo, 12, '0')
    if (!type){
       return
    }
    const accounts = await db.wxuser.findOne({ '_id': userId }, { hisAccount: 1 }).lean()
    if (accounts.hisAccount.length > 0) {
      for (let account of accounts.hisAccount) {
        if (account.healthNo === healthNo) {
           throw createErr(400, '该卡已绑定')
        }
      }
    }
  }
  
  //  生成指定长度的随机数
  async get_nonce_str(len){
    let str = ''
    while (str.length < len) {
        str +=  Math.random().toString(36).slice(2)
    }
    return str.slice(-len)
  }

  //  门诊预交金充值
  async rechargeHisAccountAPI(ctx, next) {
    const { userId, HisID, total_fee, openid, sign } = ctx.state.params
    const data = _.omitBy(
      {
        userId,
        HisID,
        total_fee,
      },
      _.isUndefined
    )
    const arr = Object.keys(data).sort().map(item => {
      return `${item}=${data[item]}`
    })
    const str = arr.join('&')
    const signStr = await this.getSign(str)
    // if(signStr !== sign) throw createErr(400, '签名错误')

    const order = await db.order.create(data)

    let obj = {
      appid: config.WECHAT.APP_ID,
      mch_id: config.WECHAT.MCH_ID,
      nonce_str: await this.get_nonce_str(32),
      body: '门诊预交金充值',
      out_trade_no: order._id.toString(),
      total_fee: parseInt(total_fee * 100),
      spbill_create_ip: ctx.ip.slice(7),
      notify_url: config.WECHAT.NOTIFY_URL,
      trade_type:'JSAPI',
      attach: HisID,
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
      if( prepay_id ){
          res = await this.getClientPayConfig(prepay_id)   
      }
    }catch(err){
        console.log('Pay ERR', err)
    }
    ctx.body = res
  }

  // 支付结果通知
  async payNotifyAPI(ctx, next) {
    const xml = await new Promise((resolve, reject) => {
      try {
          let xmlData = ''
          ctx.req.on('data', (data) => {
              xmlData += data.toString("utf-8")
          })
          ctx.req.on('end', () => {
              resolve(xmlData)
          })
      } catch (err) {
          reject(err)
      }
    })

    const data = await xmlUtil.parseXml(xml)

    let payQuery = {
      appid: data.xml.appid,
      mch_id: data.xml.mch_id,
      nonce_str: data.xml.nonce_str,
      out_trade_no: data.xml.out_trade_no,
      attach: data.xml.attach,
    }
    const payQueryArr = Object.keys(payQuery).sort().map(item => {
      return `${item}=${payQuery[item]}`
    })
    const payQueryStr = payQueryArr.join('&') + '&key=' + config.WECHAT.KEY
    payQuery.sign = await this.getSign(payQueryStr)

    //  查询支付结果
    const result = await this.wechatPayResult(payQuery)    

    //  告知微信已收到，并调 HIS 接口充值
    if (result.xml.return_code && result.xml.return_code == 'SUCCESS' && result.xml.trade_state == 'SUCCESS' ) {
      const ChargeAmt = (await db.order.find({ '_id': out_trade_no })).total_fee
      const data = 
      `<![CDATA[
        <HisTrans>
        <TranCode>ChargeToClinicCard</TranCode>
        <FtyCode>DM01</FtyCode>
        <DevNo></DevNo>
        <DevSeqNo></DevSeqNo>
        <Date>${ moment().format('YYYYMMDD') }</Date>
        <Time>${ moment().format('hhmmss') }</Time>
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

  //  门诊预交金充值记录查询
  async rechargeHisAccountHistoryAPI(ctx, next) {
    const { HisID, QueryBeginDate, QueryEndDate, PageNo, PageSize } = ctx.state.params
    const data = 
      `<![CDATA[
        <HisTrans>
        <TranCode>ChargeMZHistory</TranCode>
        <FtyCode>DM01</FtyCode>
        <DevNo></DevNo>
        <DevSeqNo></DevSeqNo>
        <Date></Date>
        <Time></Time>
        <HisID >${ HisID }</HisID >
        <PageNo>${ PageNo }</PageNo>
        <PageSize>${ PageSize }</PageSize>
        <QueryBeginDate>${ QueryBeginDate ? QueryBeginDate : '' }</QueryBeginDate>
        <QueryEndDate>${ QueryEndDate ? QueryEndDate : '' }</QueryEndDate>
        </HisTrans>
      ]]>`
    ctx.body = await xmlUtil.handleXml(data, true)
  }

  //  余额查询
  async inquireBalanceAPI(ctx) {
    const { HisID } = ctx.state.params
    const data = 
      `<![CDATA[
        <HisTrans>
        <TranCode>GetHealthYE</TranCode>
        <FtyCode>DM01</FtyCode>
        <DevNo></DevNo>
        <DevSeqNo></DevSeqNo>
        <HisID >${ HisID }</HisID >
        </HisTrans>
      ]]>`
    ctx.body = await xmlUtil.handleXml(data, true)
  }

  //  MD5加密
  async getSign (str) {
    let hash = crypto.createHash('md5').update(str,'utf8')
    return hash.digest('hex').toUpperCase()
  }

  async getClientPayConfig(prepay_id) {
    let obj = {
        appId: config.WECHAT.APP_ID,
        timeStamp: String(Math.floor(Date.now()/1000)),
        nonceStr: await this.get_nonce_str(32),
        package: 'prepay_id=' + prepay_id,
        signType: 'MD5'
    }
    const arr = Object.keys(obj).sort().map(item => {
        return `${item}=${obj[item]}`
    })
    const str = arr.join('&') + '&key=' + config.WECHAT.KEY
    obj.paySign = await this.getSign(str)
    return obj
  }

  async wechatPay(obj) {
    const xml = await xmlUtil.json2xml(obj)
    const result = await axios.axios_post(
      config.WECHAT.PREPAY_URL,
      xml
    )
    return (await xmlUtil.parseXml(result.data)).xml
  }

  async wechatPayResult(obj) {
    const xml = await xmlUtil.json2xml(obj)
    const result = await axios.axios_post(
      config.WECHAT.ORDERQUERY_URL,
      xml
    )
    return (await xmlUtil.parseXml(result.data)).xml
  }

}

module.exports = new UserCtrl()
