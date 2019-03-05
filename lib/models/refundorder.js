module.exports = Schema => {
  const RefundorderSchema = new Schema(
    {
      userId: {
          type: Schema.Types.ObjectId,
          required: true
      },
      HisID: {
        type: String,
        required: true
      },
      refund_fee: {
        type: Number,
        required: true
      },
      isRefund: {
        type: Boolean,
        required: true,
        default: false
      },
      orderId: {
        type: Schema.Types.ObjectId,
        required: true
    },
      //  状态，0：未退款，1：微信已退款，HIS未扣款，2：微信已退款，HIS已扣款
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
  return RefundorderSchema
}
