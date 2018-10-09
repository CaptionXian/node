module.exports = Schema => {
    const DoctorSchema = new Schema(
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
            department: {
                type: Schema.Types.ObjectId,
                required: true
            },
            isExpert: {
                type: Boolean,
                required: true,
                default: false
            },
            position: {
                type: String, 
                maxLength: 200,
                required: true,
                default: ''
            },
            sort: {
                type: Number,
                required: true,
                default: 5
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
    return DoctorSchema
}