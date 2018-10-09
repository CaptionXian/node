module.exports = Schema => {
    const WellnessSchema = new Schema(
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
                type: String,
                required: true,
                default: ''
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
    return WellnessSchema
}