module.exports = Schema => {
  const RecordSchema = new Schema(
    {
      userId: {
          type: Schema.Types.ObjectId,
          required: true
      },
      hisID: {
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
  return RecordSchema
}
