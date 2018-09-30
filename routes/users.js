const router = require('koa-router')()
const ajvValidator = require('../lib/middlewares/ajv')
const userCtrl = require('../lib/controllers/user')

router.prefix('/users')

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
          'endoscopy'
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
        'endoscopy'
      ]},
    }
  }),
  async (ctx, next) => {
    await userCtrl.getQuestionnaireAPI(ctx, next)
  }
)

module.exports = router
