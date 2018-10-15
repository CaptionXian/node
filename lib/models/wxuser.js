module.exports = Schema => {
    const WxUserSchema = new Schema(
      {
        openid: { type: String, require: true },
        nickname: { type: String, require: true },
        sex: { type: Number, require: true },
        city: { type: String, require: true },
        province: { type: String, require: true },
        country: { type: String, require: true },
        headimgurl: { type: String, require: true },
        created: { type: Date, default: Date.now },
        updated: { type: Date, default: Date.now }
      },
      {
        id: false,
        read: 'secondaryPreferred',
        toJSON: {
          versionKey: false
        }
      }
    )
  
    return WxUserSchema
  }
  