module.exports = Schema => {
  const HisSchema = new Schema(
    {
      hisID: {
        type: String,
        require: true
      },
      healthNo: {
        type: String,
        require: true
      },
      lastLoginTime: {
        type: Date,
        default: Date.now
      }
    },
    {
      id: false,
      _id: false,
      read: 'secondaryPreferred',
      toJSON: {
        versionKey: false
      }
    }
  )
  return HisSchema
}