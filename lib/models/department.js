module.exports = Schema => {
  const DepartmentSchema = new Schema(
    {
      title: {
        type: String,
        maxLength: 200,
        required: true,
        default: ''
      },
      content: {
        type: String,
        required: true,
        default: ''
      },
      imgUrl: {
        type: String
      },
      sort: {
        type: Number,
        required: true,
        default: 1
      },
      isDeleted: {
        type: Boolean,
        required: true,
        default: false
      },
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
  return DepartmentSchema
}
