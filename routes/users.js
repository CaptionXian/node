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

router.get('/schedule', async (ctx, next) => {
  await hospitalCtrl.getHospitalScheduleAPI(ctx, next)
})

router.get('/attendance', async (ctx, next) => {
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
      type: { type: 'string',
        enum: [
          'clinic',
          'toll',
          'pharmacy',
          'laboratory',
          'radiology',
          'ultrasound',
          'endoscopy',
          'in-patient'
        ] },
      answer: { type: 'array' },
      advantage: { type: 'string' },
      defect: { type: 'string' }
    },
    required: [ 'name', 'date', 'tel', 'type', 'answer' ]
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
      userId: { type: 'string', format: 'objectid' },
      type: { type: 'string',
        enum: [
          'clinic',
          'toll',
          'pharmacy',
          'laboratory',
          'radiology',
          'ultrasound',
          'endoscopy',
          'in-patient'
        ] }
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
      userId: { type: 'string', format: 'objectid' },
      name: { type: 'string' },
      tel: { type: 'string' },
      address: { type: 'string' },
      note: { type: 'string' }
    },
    required: ['name', 'tel', 'address']
  }),
  async (ctx, next) => {
    await userCtrl.submitMedicalRecordCopyAPI(ctx, next)
  }
)

router.post(
  '/patientInformation',
  ajvValidator({
    type: 'object',
    properties: {
      date: { type: 'string' },
      Time: { type: 'string' },
      BussAcctType: { type: 'number' },
      AccountNo: { type: 'string' },
      Tel: { type: 'string' },
      Name: { type: 'string' }
    },
    required: ['BussAcctType', 'AccountNo']
  }),
  async (ctx, next) => {
    await userCtrl.getPatientInformation(ctx, next)
  }
)

router.post(
  '/userTieCard',
  ajvValidator({
    type: 'object',
    properties: {
      userId: { type: 'string', format: 'objectid' },
      healthNo: { type: 'string' },
      hisID: { type: 'string' },
      type: { type: 'boolean' }
    },
    required: ['userId', 'healthNo', 'hisID', 'type']
  }),
  async (ctx, next) => {
    await userCtrl.userTieCardAPI(ctx, next)
  }
)

//  预交金充值
router.post(
  '/rechargeHisAccount',
  ajvValidator({
    type: 'object',
    properties: {
      userId: { type: 'string', format: 'objectid' },
      hisID: { type: 'string' },
      total_fee: { type: 'number' },
      sign: { type: 'string' }
    },
    required: ['userId', 'total_fee', 'hisID', 'sign']
  }),
  async (ctx, next) => {
    await userCtrl.rechargeHisAccountAPI(ctx, next)
  }
)

router.post('/payNotify', async (ctx, next) => {
    await userCtrl.payNotifyAPI(ctx, next)
  }
)

router.get(
  '/getDepts',
  ajvValidator({
    type: 'object',
    properties: {
      SuperDeptId: { type: 'number' },
      date: { type: 'string' },
      Time: { type: 'string' },
    },
    required: ['SuperDeptId']
  }),
  async (ctx, next) => {
    await userCtrl.getDepartmentsAPI(ctx, next)
  }
)

router.get(
  '/getDoctors',
  ajvValidator({
    type: 'object',
    properties: {
      DeptId: { type: 'string' },
      DoctorName: { type: 'string' },
      QueryDate: { type: 'string' },
      QueryEndDate: { type: 'string' },
      QueryTime: { type: 'number', enum: [ 0, 1, 2 ] },
      date: { type: 'string' },
      Time: { type: 'string' },
    },
    required: ['DeptId']
  }),
  async (ctx, next) => {
    await userCtrl.getDoctorsAPI(ctx, next)
  }
)

// router.get(
//   '/getDoctorWorkDate',
//   ajvValidator({
//     type: 'object',
//     properties: {
//       DeptId: { type: 'string' },
//       DoctorId: { type: 'string' },
//       QueryDate: { type: 'string' },
//       date: { type: 'string' },
//       Time: { type: 'string' },
//     },
//     required: ['DeptId', 'QueryDate']
//   }),
//   async (ctx, next) => {
//     await userCtrl.getDoctorWorkDateAPI(ctx, next)
//   }
// )

router.get(
  '/getOrderSource',
  ajvValidator({
    type: 'object',
    properties: {
      DeptId: { type: 'string' },
      DoctorId: { type: 'string' },
      QueryDate: { type: 'string' },
      QueryTime: { type: 'string', enum: ['AM', 'PM'] },
      IsAllYY: { type: 'number', enum: [0, 1] },
      date: { type: 'string' },
      Time: { type: 'string' },
    },
    required: ['DeptId', 'QueryDate', 'DoctorId']
  }),
  async (ctx, next) => {
    await userCtrl.getOrderSourceAPI(ctx, next)
  }
)

router.post(
  '/RegOrder',
  ajvValidator({
    type: 'object',
    properties: {
      HisID: { type: 'string' },
      DeptId: { type: 'string' },
      DoctorId: { type: 'string' },
      OrderDate: { type: 'string' },
      OrderTime: { type: 'string', enum: ['AM', 'PM'] },
      OrderID: { type: 'string' },
      Tel: { type: 'string' },
      date: { type: 'string' },
      Time: { type: 'string' },
    },
    required: ['HisID', 'DeptId', 'OrderID', 'DoctorId']
  }),
  async (ctx, next) => {
    await userCtrl.regOrderAPI(ctx, next)
  }
)

router.all('*', async ctx => {
  ctx.throw(404, 'notfound')
})

module.exports = router
