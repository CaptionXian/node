const config = require('config')
const axios = require('../utils/axios')
const _ = require('lodash')
const xml2js = require('xml2js')
const parseString = require('xml2js').parseString
const processors = require('xml2js/lib/processors')

module.exports = {
  //  xml 数据处理
  async handleXml(jsonData, isRecharge = true) {
    let result
    const data = 
      `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
        <soapenv:Header/>
        <soapenv:Body>
            <tem:HisTrans>
              <tem:ParamIn>
                ${jsonData}
              </tem:ParamIn>
            </tem:HisTrans>
        </soapenv:Body>
      </soapenv:Envelope>`

    let response
    try {
      response = await axios.axios_head_post(
        isRecharge ? config.HIS.RECHARGE_URL : config.HIS.RESERVATION_URL,
        { 
          'Content-Type': 'text/xml',
          'SOAPAction': 'http://tempuri.org/HisTrans'
        },
        data
      )
    } catch (error) {
      console.log("HIS Error", error)
    }
    parseString(response.data, { explicitArray:false, ignoreAttrs:true, tagNameProcessors: [processors.stripPrefix] }, function(err, hisResult) {
      parseString(hisResult.Envelope.Body.HisTransResponse.ParamOut, { explicitArray:false, ignoreAttrs:true, tagNameProcessors: [processors.stripPrefix] }, function(err, paramOut) {
        if(hisResult.Envelope.Body.HisTransResponse.HisTransResult < 0){
          console.log('hisError', paramOut.HisTrans.RespMsg)
        }
        result = paramOut.HisTrans
      })
    })
    return result
  },

  async json2xml(obj) {
    let builder = new xml2js.Builder({
        headless:true,
        allowSurrogateChars: true,
        rootName:'xml',
        cdata:true
    })
    var xml = builder.buildObject(obj)
    return xml
},

async parseXml(xml) {
    let res
    parseString(xml,  {
        trim: true,
        explicitArray: false
    }, function (err, result) {
        res = result
    })
    return res
}
}