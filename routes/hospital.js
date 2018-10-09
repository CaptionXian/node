const router = require('koa-router')()
const ajvValidator = require('../lib/middlewares/ajv')
const upload = require('../lib/middlewares/upload')
const hospitalCtrl = require('../lib/controllers/hospital')

router.prefix('/hospital')

router.get('/summary', async (ctx, next) => {
    await hospitalCtrl.getHospitalSummaryAPI(ctx, next)
  }
)

router.put(
    '/summary',
    ajvValidator({
        type: 'object',
        properties: {
            summary: { type: 'string' }
        },
        required: ['summary']
    }), 
    async (ctx, next) => {
        await hospitalCtrl.updateHospitalSummaryAPI(ctx, next)
    }
)

router.get('/schedule',async (ctx, next) => {
    await hospitalCtrl.getHospitalScheduleAPI(ctx, next)
})

router.put(
    '/schedule',
    ajvValidator({
        type: 'object',
        properties: {
            schedule: { type: 'string', maxLength: 200 }
        },
        required: ['schedule']
    }),
    async (ctx, next) => {
        await hospitalCtrl.createHospitalScheduleAPI(ctx, next)
    }
)


router.post(
    '/news',
    ajvValidator({
        type: 'object',
        properties: {
            title: { type: 'string', maxLength: 200 },
            content: { type: 'string' },
            imgUrl: { type: 'string', maxLength: 200 },
        },
        required: ['title', 'content', 'imgUrl']
    }),
    async (ctx, next) => {
        await hospitalCtrl.createHospitalNewsAPI(ctx, next)
    }
)

router.get('/news', async (ctx, next) => {
    await hospitalCtrl.getHospitalNewsAPI(ctx, next)
  }
)

router.put(
    '/news/:_id',
    ajvValidator({
        type: 'object',
        properties: {
            _id: { type: 'string', format: 'objectid' },
            title: { type: 'string', maxLength: 200 },
            content: { type: 'string' },
            imgUrl: { type: 'string', maxLength: 200 },
        },
        required: ['title', 'content', 'imgUrl', '_id']
    }),
    async (ctx, next) => {
        await hospitalCtrl.updateHospitalNewsAPI(ctx, next)
    }
)

router.delete(
    '/news/:_id',
    ajvValidator({
        type: 'object',
        properties: {
            _id: { type: 'string', format: 'objectid' }
        },
        required: ['_id']
    }),
    async (ctx, next) => {
        await hospitalCtrl.deleteHospitalNewsAPI(ctx, next)
    }
)

router.post(
    '/banner',
    ajvValidator({
        type: 'object',
        properties: {
            title: { type: 'string', maxLength: 200 },
            linkUrl: { type: 'string', maxLength: 200 },
            imgUrl: { type: 'string', maxLength: 200 },
        },
        required: ['title', 'linkUrl', 'imgUrl']
    }),
    async (ctx, next) => {
        await hospitalCtrl.createHospitalBannerAPI(ctx, next)
    }
)

router.get('/banner', async (ctx, next) => {
    await hospitalCtrl.getHospitalBannerAPI(ctx, next)
  }
)

router.put(
    '/banner/:_id',
    ajvValidator({
        type: 'object',
        properties: {
            _id: { type: 'string', format: 'objectid' },
            title: { type: 'string', maxLength: 200 },
            linkUrl: { type: 'string', maxLength: 200 },
            imgUrl: { type: 'string', maxLength: 200 },
        },
        required: ['title', 'linkUrl', 'imgUrl', '_id']
    }),
    async (ctx, next) => {
        await hospitalCtrl.updateHospitalBannerAPI(ctx, next)
    }
)

router.delete(
    '/banner/:_id',
    ajvValidator({
        type: 'object',
        properties: {
            _id: { type: 'string', format: 'objectid' }
        },
        required: ['_id']
    }),
    async (ctx, next) => {
        await hospitalCtrl.deleteHospitalBannerAPI(ctx, next)
    }
)

router.post(
    '/department',
    ajvValidator({
        type: 'object',
        properties: {
            title: { type: 'string', maxLength: 200 },
            content: { type: 'string' },
            imgUrl: { type: 'string', maxLength: 200 },
        },
        required: ['title', 'content', 'imgUrl']
    }),
    async (ctx, next) => {
        await hospitalCtrl.createHospitalDepartmentAPI(ctx, next)
    }
)

router.get('/department', async (ctx, next) => {
    await hospitalCtrl.getHospitalDepartmentAPI(ctx, next)
  }
)

router.put(
    '/department/:_id',
    ajvValidator({
        type: 'object',
        properties: {
            _id: { type: 'string', format: 'objectid' },
            title: { type: 'string', maxLength: 200 },
            content: { type: 'string' },
            imgUrl: { type: 'string', maxLength: 200 },
        },
        required: ['title', 'content', 'imgUrl', '_id']
    }),
    async (ctx, next) => {
        await hospitalCtrl.updateHospitalDepartmentAPI(ctx, next)
    }
)

router.put(
    '/department',
    ajvValidator({
        type: 'object',
        properties: {
            departments: { 
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', format: 'objectid' },
                        sort: { type: 'number' }
                    }
                }
            }
        },
        required: ['departments']
    }),
    async (ctx, next) => {
        await hospitalCtrl.updateHospitalDepartmentSortAPI(ctx, next)
    }
)

router.delete(
    '/department/:_id',
    ajvValidator({
        type: 'object',
        properties: {
            _id: { type: 'string', format: 'objectid' }
        },
        required: ['_id']
    }),
    async (ctx, next) => {
        await hospitalCtrl.deleteHospitalDepartmentAPI(ctx, next)
    }
)

router.post(
    '/doctor',
    ajvValidator({
        type: 'object',
        properties: {
            title: { type: 'string', maxLength: 200 },
            content: { type: 'string' },
            imgUrl: { type: 'string', maxLength: 200 },
            department: { type: 'string', format: 'objectid' },
            position: { type: 'string', maxLength: 200 },
            isExpert: { type: 'boolean' }
        },
        required: ['title', 'content', 'imgUrl', 'department', 'position']
    }),
    async (ctx, next) => {
        await hospitalCtrl.createHospitalDoctorAPI(ctx, next)
    }
)

router.get(
    '/doctor',
    ajvValidator({
        type: 'object',
        properties: {
            isExpert: { type: 'boolean' },
            department: { type: 'string', format: 'objectid' }
        }
    }),
    async (ctx, next) => {
        await hospitalCtrl.getHospitalDoctorAPI(ctx, next)
    }
)

router.get(
    '/department/:_id/doctor',
    ajvValidator({
        type: 'object',
        properties: {
            _id: { type: 'string', format: 'objectid' }
        },
        required: ['_id']
    }), 
    async (ctx, next) => {
        await hospitalCtrl.getHospitalDoctorByDepartmentAPI(ctx, next)
    }
)

router.put(
    '/doctor/:_id',
    ajvValidator({
        type: 'object',
        properties: {
            _id: { type: 'string', format: 'objectid' },
            title: { type: 'string', maxLength: 200 },
            content: { type: 'string' },
            imgUrl: { type: 'string', maxLength: 200 },
            department: { type: 'string', format: 'objectid' },
            position: { type: 'string', maxLength: 200 },
            isExpert: { type: 'boolean' }
        },
        required: ['title', 'content', 'imgUrl', '_id', 'department', 'position']
    }),
    async (ctx, next) => {
        await hospitalCtrl.updateHospitalDoctorAPI(ctx, next)
    }
)

router.put(
    '/doctor',
    ajvValidator({
        type: 'object',
        properties: {
            doctors: { 
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', format: 'objectid' },
                        expertSort: { type: 'number' },
                        departmentSort: { type: 'number' }
                    }
                }
            },
            type: { type: 'string', enum: ['expert', 'department'] },
        },
        required: ['doctors', 'type']
    }),
    async (ctx, next) => {
        await hospitalCtrl.updateHospitalDoctorSortAPI(ctx, next)
    }
)

router.delete(
    '/doctor/:_id',
    ajvValidator({
        type: 'object',
        properties: {
            _id: { type: 'string', format: 'objectid' }
        },
        required: ['_id']
    }),
    async (ctx, next) => {
        await hospitalCtrl.deleteHospitalDoctorAPI(ctx, next)
    }
)

router.post(
    '/wellness',
    ajvValidator({
        type: 'object',
        properties: {
            title: { type: 'string', maxLength: 200 },
            content: { type: 'string' },
            imgUrl: { type: 'string', maxLength: 200 }
        },
        required: ['title', 'content', 'imgUrl']
    }),
    async (ctx, next) => {
        await hospitalCtrl.createHospitalWellnessAPI(ctx, next)
    }
)

router.get('/wellness', async (ctx, next) => {
    await hospitalCtrl.getHospitalWellnessAPI(ctx, next)
  }
)

router.put(
    '/wellness/:_id',
    ajvValidator({
        type: 'object',
        properties: {
            _id: { type: 'string', format: 'objectid' },
            title: { type: 'string', maxLength: 200 },
            content: { type: 'string' },
            imgUrl: { type: 'string', maxLength: 200 }
        },
        required: ['title', 'content', 'imgUrl', '_id']
    }),
    async (ctx, next) => {
        await hospitalCtrl.updateHospitalWellnessAPI(ctx, next)
    }
)

router.delete(
    '/wellness/:_id',
    ajvValidator({
        type: 'object',
        properties: {
            _id: { type: 'string', format: 'objectid' }
        },
        required: ['_id']
    }),
    async (ctx, next) => {
        await hospitalCtrl.deleteHospitalWellnessAPI(ctx, next)
    }
)

router.post(
    '/partybuilding',
    ajvValidator({
        type: 'object',
        properties: {
            title: { type: 'string', maxLength: 200 },
            content: { type: 'string' },
            imgUrl: { type: 'string', maxLength: 200 }
        },
        required: ['title', 'content', 'imgUrl']
    }),
    async (ctx, next) => {
        await hospitalCtrl.createHospitalPartyBuildingAPI(ctx, next)
    }
)

router.get('/partybuilding', async (ctx, next) => {
    await hospitalCtrl.getHospitalPartyBuildingAPI(ctx, next)
  }
)

router.put(
    '/partybuilding/:_id',
    ajvValidator({
        type: 'object',
        properties: {
            _id: { type: 'string', format: 'objectid' },
            title: { type: 'string', maxLength: 200 },
            content: { type: 'string' },
            imgUrl: { type: 'string', maxLength: 200 }
        },
        required: ['title', 'content', 'imgUrl', '_id']
    }),
    async (ctx, next) => {
        await hospitalCtrl.updateHospitalPartyBuildingAPI(ctx, next)
    }
)

router.delete(
    '/partybuilding/:_id',
    ajvValidator({
        type: 'object',
        properties: {
            _id: { type: 'string', format: 'objectid' }
        },
        required: ['_id']
    }),
    async (ctx, next) => {
        await hospitalCtrl.deleteHospitalPartyBuildingAPI(ctx, next)
    }
)

router.post(
    '/upload',
    upload.single('file'),
    async (ctx, next) => {
        await hospitalCtrl.uploadImageAPI(ctx, next)
    }
)


module.exports = router