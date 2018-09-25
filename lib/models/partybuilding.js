module.exports = Schema => {
    const PartybuildingSchema = new Schema(
        {
            title: { 
                type: String, 
                maxLength: 200,
                required: true,
                default: ''
            },
            content: {
                type: String, 
                maxLength: 500,
                required: true,
                default: ''
            },
            imgUrl: {
                type: String,
                required: true,
                default: ''
            },
            isDeteled: {
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
    return PartybuildingSchema
}