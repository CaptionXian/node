module.exports = Schema => {
    const RecordSchema = new Schema(
        {
            // userId: {
            //     type: Schema.Types.ObjectId,
            //     required: true,
            //     default: ''
            // },
            name: { 
                type: String, 
                maxLength: 200,
                required: true,
                default: ''
            },
            tel: {
                type: String,
                required: true,
                default: ''
            },
            address: {
                type: String,
                required: true,
                default: ''
            },
            isSend: {
                type: Boolean,
                required: true,
                default: false
            },
            created: { type: Date, default: Date.now }
        },
        {
            id: false,
            read: 'secondaryPreferred',
            toJSON: {
                versionKey: false
            }
        }
    )
    return RecordSchema
}