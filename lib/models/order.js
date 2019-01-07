module.exports = Schema => {
  const OrderSchema = new Schema(
    {
      userId: {
          type: Schema.Types.ObjectId,
          required: true
      },
      HisID: {
        type: String,
        required: true
      },
      total_fee: {
        type: String,
        required: true
      },
      isPay: {
        type: Boolean,
        required: true,
        default: false
      },
      //  状态，0：待付款，1：微信已支付，HIS未充值，2：微信已支付，HIS已充值
      state: {
        type: Number,
        required: true,
        default: 0
      }
    },
    {
      id: false,
      read: 'secondaryPreferred',
      toJSON: {
        versionKey: false
      },
      timestamps: { 
        createdAt: 'created', 
        updatedAt: 'updated' 
      }
    }
  )
  return OrderSchema
}
