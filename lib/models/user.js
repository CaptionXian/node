module.exports = Schema => {
    const UserSchema = new Schema(
        {
            userName: { 
                type: String, 
                maxLength: 200,
                required: true
            },
            passWord: {
                type: String, 
                maxLength: 32,
                required: true
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
            },
            toJSON: {
                versionKey: false,
                transform (doc, ret, options) {
                  delete ret.isDeleted
                  delete ret.passWord
                  return ret
                }
            }
        }
    )
    return UserSchema
}