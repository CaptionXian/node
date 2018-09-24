module.exports = Schema => {
    const HospitalSchema = new Schema(
        {
            summary: { 
                type: String, 
                maxLength: 500,
                required: true,
                default: ''
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
    return HospitalSchema
}