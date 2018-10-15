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
            authority: {
                type: Array,
                require: true,
                default: []
            },
            isDeleted: {
                type: Boolean,
                required: true,
                default: false
            },
            isAdmin: {
                type: Boolean,
                required: true,
                default: false
            },
            token: {
                type: String, 
                maxLength: 200,
            },
            lastLoginTime: { type: Date, default: Date.now },
            created: { type: Date, default: Date.now },
            updated: { type: Date, default: Date.now }
        },
        {
            id: false,
            read: 'secondaryPreferred',
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