const router = require('koa-router')()
const ajvValidator = require('../lib/middlewares/ajv')
const userCtrl = require('../lib/controllers/user')
const hospitalCtrl = require('../lib/controllers/hospital')

router.prefix('/users')

router.get('/code', async (ctx, next) => {
    await userCtrl.getAccessTokenAPI(ctx, next)
  }
)

router.get('/summary', async (ctx, next) => {
     await hospitalCtrl.getHospitalSummaryAPI(ctx, next)
  }
)

router.get('/schedule',async (ctx, next) => {
  await hospitalCtrl.getHospitalScheduleAPI(ctx, next)
})

router.get('/attendance',async (ctx, next) => {
  await hospitalCtrl.getHospitalAttendanceAPI(ctx, next)
})

router.get('/news', async (ctx, next) => {
    await hospitalCtrl.getHospitalNewsAPI(ctx, next)
  }
)

router.get('/banner', async (ctx, next) => {
    await hospitalCtrl.getHospitalBannerAPI(ctx, next)
  }
)

router.get('/department', async (ctx, next) => {
    await hospitalCtrl.getHospitalDepartmentAPI(ctx, next)
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

router.get('/wellness', async (ctx, next) => {
    await hospitalCtrl.getHospitalWellnessAPI(ctx, next)
  }
)

router.get('/partybuilding', async (ctx, next) => {
    await hospitalCtrl.getHospitalPartyBuildingAPI(ctx, next)
  }
)

router.post(
  '/questionnaire',
  ajvValidator({
    type: 'object',
    properties: {
        name: { type: 'string', maxLength: 100 },
        date: { type: 'string', format: 'date-time' },
        tel: { type: 'string' },
        type: { type: 'string', enum: [
          'clinic',
          'toll',
          'pharmacy',
          'laboratory',
          'radiology',
          'ultrasound',
          'endoscopy',
          'in-patient'
        ]},
        answer: { type: 'array' },
        advantage: { type: 'string' },
        defect: { type: 'string' }
    },
    required: [ 'name', 'date', 'tel', 'type', 'answer', 'advantage', 'defect' ]
  }), 
  async (ctx, next) => {
      await userCtrl.submitQuestionnaireAPI(ctx, next)
  }
)

router.get(
  '/questionnaire',
  ajvValidator({
    type: 'object',
    properties: {
      userId: { type: 'string', format: "objectid" },
      type: { type: 'string', enum: [
        'clinic',
        'toll',
        'pharmacy',
        'laboratory',
        'radiology',
        'ultrasound',
        'endoscopy',
        'in-patient'
      ]},
    }
  }),
  async (ctx, next) => {
    await userCtrl.getQuestionnaireAPI(ctx, next)
  }
)

router.post(
  '/medicalRecordCopy',
  ajvValidator({
    type: 'object',
    properties: {
      userId: { type: 'string', format: "objectid" },
      name: { type: 'string' },
      tel: { type: 'string' },
      address: { type: 'string' }
    },
    require: ['name', 'tel', 'address']
  }),
  async (ctx, next) => {
    await userCtrl.submitMedicalRecordCopyAPI(ctx, next)
  }
)

module.exports = router
