module.exports = Schema => {
    const WxUserSchema = new Schema(
      {
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
  