module.exports = Schema => {
    const QuestionnaireSchema = new Schema(
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
            date: {
                type: Date,
                default: Date.now
            },
            tel: {
                type: String,
                required: true,
                default: ''
            },
            isDeleted: {
                type: Boolean,
                required: true,
                default: false
            },
            // 问卷类型: 诊室、收费处，药房，检验科，放射科，超声科，内镜中心，住院部
            type: {
                type: String,
                enum: [
                    'clinic',
                    'toll',
                    'pharmacy',
                    'laboratory',
                    'radiology',
                    'ultrasound',
                    'endoscopy',
                    'in-patient'
                ]
            },
            answer: [{
                content: {
                    type: String
                },
                score: {
                    type: String
                },
                optionIndex: {
                    type: Number
                },
                comment: {
                    type: String
                }
            }],
            advantage: {
                type: String
            },
            defect: {
                type: String
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
    return QuestionnaireSchema
}