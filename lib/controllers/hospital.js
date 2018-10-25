const db = require('limbo').use('hospital')
const { Base } = require('./base')
const jsonify = require('../utils/jsonify')
const ObjectId = require('mongoose').Types.ObjectId
const _ = require('lodash')
const createErr = require('http-errors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const excel = require('../utils/excel')
const urlencode = require('urlencode')

class HospitalCtrl extends Base {
    //  登录
    async loginHospitalAPI(ctx, next) {
        const { userName, passWord } = ctx.state.params
        const conds = {
            userName: userName,
            isDeleted: false
        }
        const user = await db.user.findOne(conds)
        if(!user)throw createErr(400, '用户不存在')
        if(!bcrypt.compareSync(passWord, user.passWord)){
            throw createErr(400, '密码错误')
        }

        ctx.body = user

        await jsonify(ctx)
        await this.setWithUserToken(ctx)
    }

    //  带token
    async setWithUserToken(ctx, next) {
        let user = ctx.body
        const token = jwt.sign(
            { 
                name: user.userName,
                _id: user._id,
                authority: user.authority
            },
            config.AUTH.SECRET,
            { expiresIn: config.AUTH.EXPIRES }
        )

        const data = {
            token,
            lastLoginTime: new Date()
        }

        await db.user.findOneAndUpdate(
            { _id: ObjectId(user._id) },
            data
        )

        user.token = token
    }

    //  登出
    async logoutHospitalAPI(ctx, next) {
        const _id = ctx.state.user._id
        const data = {
            token: '',
            updated: new Date()
        }
        await db.user.findOneAndUpdate(
            { _id },
            data
        )
        ctx.body = {}
    }

    //  新增用户
    async createHospitalUserAPI(ctx, next) {
        const { userName, passWord, authority } = ctx.state.params
        const salt = bcrypt.genSaltSync(10)
        const conds = {
            userName: userName,
            isDeleted: false
        }
        const user = await db.user.findOne(conds)
        if(user)throw createErr(400, '用户名已存在')

        const data = {
            userName: userName,
            passWord: bcrypt.hashSync(passWord, salt),
            authority
        }

        ctx.body = await db.user.create(data)
    }

    //  获取用户列表
    async getHospitalUserAPI(ctx, next) {
        const conds = { isDeleted: false }
        ctx.body = await db.user.find(conds)
    }

    //  编辑用户
    async updateHospitalUserAPI(ctx, next) {
        const { userName, passWord, _id, authority } = ctx.state.params
        const salt = bcrypt.genSaltSync(10)
        const data = _.omitBy(
            {
                userName: userName,
                passWord: passWord ? bcrypt.hashSync(passWord, salt) : undefined,
                updated: new Date(),
                authority
            },
            _.isUndefined
        )

        ctx.body = await db.user.findOneAndUpdate(
            { _id },
            data,
            { new: true }
        )
    }

    //  删除用户
    async deleteHospitalUserAPI(ctx, next) {
        const { _id } = ctx.state.params
        const data = {
            isDeleted: true,
            updated: new Date()
        }

        ctx.body = await db.user.findOneAndUpdate(
            { _id },
            data,
            { new: true }
        )
    }

    //  获取简介
    async getHospitalSummaryAPI(ctx, next) {
        // await this.validatePermission(ctx, 0)
        const summary = await db.hospital.find()
        ctx.body = summary
    }

    //  更新简介
    async updateHospitalSummaryAPI(ctx, next) {
        // await this.validatePermission(ctx, 0)
        const { summary } = ctx.state.params
        ctx.body = await db.hospital.findOneAndUpdate(
            {},
            {
                summary: summary,
                updated: new Date()
            },
            { upsert: true, new: true }
        )
    }

    //  获取排班表
    async getHospitalScheduleAPI(ctx, next) {
        ctx.body = (await db.hospital.findOne()).schedule
    }

    //  新增排班表
    async createHospitalScheduleAPI(ctx, next) {
        const { schedule } = ctx.state.params
        ctx.body = (await db.hospital.findOneAndUpdate(
            {},
            {
                schedule,
                updated: new Date()
            },
            { new: true }
        )).schedule
    }

    //  获取值班表
    async getHospitalAttendanceAPI(ctx, next) {
        ctx.body = (await db.hospital.findOne()).attendance
    }

    //  新增值班表
    async createHospitalAttendanceAPI(ctx, next) {
        const { attendance } = ctx.state.params
        ctx.body = (await db.hospital.findOneAndUpdate(
            {},
            {
                attendance,
                updated: new Date()
            },
            { new: true }
        )).attendance
    }

    //  获取新闻列表
    async getHospitalNewsAPI(ctx, next) {
        // await this.validatePermission(ctx, 1)
        const conds = { isDeleted: false }
        ctx.body = await db.news.find(conds)
    }

    //  新增新闻
    async createHospitalNewsAPI(ctx, next) {
        // await this.validatePermission(ctx, 1)
        const { title, content, imgUrl } = ctx.state.params
        const data = {
            title,
            content,
            imgUrl
        }

        ctx.body = await db.news.create(data)
    }

    //  编辑新闻
    async updateHospitalNewsAPI(ctx, next) {
        // await this.validatePermission(ctx, 1)
        const { title, content, imgUrl, _id } = ctx.state.params
        const data = {
            title,
            content,
            imgUrl,
            updated: new Date()
        }

        ctx.body = await db.news.findOneAndUpdate(
            { _id },
            data,
            { upsert: true, new: true }
        )
    }

    //  删除新闻
    async deleteHospitalNewsAPI(ctx, next) {
        // await this.validatePermission(ctx, 1)
        const { _id } = ctx.state.params
        const data = {
            isDeleted: true,
            updated: new Date()
        }

        ctx.body = await db.news.findOneAndUpdate(
            { _id },
            data,
            { upsert: true, new: true }
        )
    }

    //  获取轮播图列表
    async getHospitalBannerAPI(ctx, next) {
        // await this.validatePermission(ctx, 0)
        const conds = { isDeleted: false }
        ctx.body = await db.banner.find(conds)
    }
    
    //  新增轮播图
    async createHospitalBannerAPI(ctx, next) {
        // await this.validatePermission(ctx, 0)
        const { title, linkUrl, imgUrl } = ctx.state.params
        const data = {
            title,
            linkUrl,
            imgUrl
        }

        ctx.body = await db.banner.create(data)
    }

    //  编辑轮播图
    async updateHospitalBannerAPI(ctx, next) {
        // await this.validatePermission(ctx, 0)
        const { title, linkUrl, imgUrl, _id } = ctx.state.params
        const data = {
            title,
            linkUrl,
            imgUrl,
            updated: new Date()
        }

        ctx.body = await db.banner.findOneAndUpdate(
            { _id },
            data,
            { upsert: true, new: true }
        )
    }

    //  删除轮播图
    async deleteHospitalBannerAPI(ctx, next) {
        // await this.validatePermission(ctx, 0)
        const { _id } = ctx.state.params
        const data = {
            isDeleted: true,
            updated: new Date()
        }

        ctx.body = await db.banner.findOneAndUpdate(
            { _id },
            data,
            { upsert: true, new: true }
        )
    }

    //  获取科室列表
    async getHospitalDepartmentAPI(ctx, next) {
        // await this.validatePermission(ctx, 2)
        const conds = { isDeleted: false }
        ctx.body = await db.department.find(conds).sort({ sort: 1 })
    }

    //  新增科室
    async createHospitalDepartmentAPI(ctx, next) {
        // await this.validatePermission(ctx, 2)
        const { title, content, imgUrl } = ctx.state.params
        const data = {
            title,
            content,
            imgUrl
        }

        ctx.body = await db.department.create(data)
    }

    //  编辑科室
    async updateHospitalDepartmentAPI(ctx, next) {
        // await this.validatePermission(ctx, 2)
        const { title, content, imgUrl, _id } = ctx.state.params
        const data = {
            title,
            content,
            imgUrl,
            updated: new Date()
        }

        ctx.body = await db.department.findOneAndUpdate(
            { _id },
            data,
            { upsert: true, new: true }
        )
    }

    //  编辑科室排序
    async updateHospitalDepartmentSortAPI(ctx, next) {
        // await this.validatePermission(ctx, 2)
        const { departments } = ctx.state.params
        const conds = { isDeleted: false }
        for(let department of departments) {
            await db.department.findOneAndUpdate(
                { _id: department._id },
                { sort: department.sort },
                { upsert: true, new: true }
            )
        }
        
        ctx.body = await db.department.find(conds).sort({ sort: 1 })
    }

    //  删除科室
    async deleteHospitalDepartmentAPI(ctx, next) {
        // await this.validatePermission(ctx, 2)
        const { _id } = ctx.state.params
        const doctor = await db.doctor.find({ department: _id }).find()
        if(!_.isEmpty(doctor)){
            throw createErr(400, '该科室下有医生存在，无法删除')
        }
        const data = {
            isDeleted: true,
            updated: new Date()
        }

        ctx.body = await db.department.findOneAndUpdate(
            { _id },
            data,
            { upsert: true, new: true }
        )
    }

    //  获取医生列表
    async getHospitalDoctorAPI(ctx, next) {
        // await this.validatePermission(ctx, 3)
        const { isExpert, department } = ctx.state.params
        const conds = _.omitBy(
            {
                isExpert,
                department,
                isDeleted: false
            },
            _.isUndefined
          )

        ctx.body = await db.doctor.find(conds).sort({ expertSort: 1 })
        if(department){
            ctx.body = await db.doctor.find(conds).sort({ departmentSort: 1 })
        }
        
        await jsonify(ctx)
        await this.setWithDepartmentName(ctx)
    }

    //  根据科室获取医生
    async getHospitalDoctorByDepartmentAPI(ctx, next) {
        // await this.validatePermission(ctx, 3)
        const { _id } = ctx.state.params
        const conds = { department: _id, isDeleted: false }
        ctx.body = await db.doctor.find(conds)

        await jsonify(ctx)
        await this.setWithDepartmentName(ctx)
    }

    //  新增医生
    async createHospitalDoctorAPI(ctx, next) {
        // await this.validatePermission(ctx, 3)
        const { title, content, imgUrl, department, position, isExpert } = ctx.state.params
        const data = {
            title,
            content,
            imgUrl,
            department,
            position,
            isExpert
        }

        ctx.body = await db.doctor.create(data)

        await jsonify(ctx)
        await this.setWithDepartmentName(ctx)
    }

    //  编辑医生
    async updateHospitalDoctorAPI(ctx, next) {
        // await this.validatePermission(ctx, 3)
        const { title, content, imgUrl, _id, department, position, isExpert } = ctx.state.params
        const data = {
            title,
            content,
            imgUrl,
            department,
            updated: new Date(),
            position,
            isExpert
        }

        ctx.body = await db.doctor.findOneAndUpdate(
            { _id },
            data,
            { upsert: true, new: true }
        )

        await jsonify(ctx)
        await this.setWithDepartmentName(ctx)
    }

    //  编辑医生排序
    async updateHospitalDoctorSortAPI(ctx, next) {
        // await this.validatePermission(ctx, 3)
        const { doctors, type } = ctx.state.params
        const conds = { isDeleted: false }
        if(type === 'expert'){
            for(let doctor of doctors) {
                await db.doctor.findOneAndUpdate(
                    { _id: doctor._id },
                    { expertSort: doctor.expertSort },
                    { upsert: true, new: true }
                )
            }
            // ctx.body = await db.department.find(conds).sort({ expertSort: 1 })
        }else{
            for(let doctor of doctors) {
                await db.doctor.findOneAndUpdate(
                    { _id: doctor._id },
                    { departmentSort: doctor.departmentSort },
                    { upsert: true, new: true }
                )
            }
            // ctx.body = await db.department.find(conds).sort({ departmentSort: 1 })
        }
        ctx.body = await db.doctor.find(conds)
    }

    //  删除医生
    async deleteHospitalDoctorAPI(ctx, next) {
        // await this.validatePermission(ctx, 3)
        const { _id } = ctx.state.params
        const data = {
            isDeleted: true,
            updated: new Date()
        }

        ctx.body = await db.doctor.findOneAndUpdate(
            { _id },
            data,
            { upsert: true, new: true }
        )

        await jsonify(ctx)
        await this.setWithDepartmentName(ctx)
    }

    //  获取健康知识点列表
    async getHospitalWellnessAPI(ctx, next) {
        // await this.validatePermission(ctx, 4)
        const conds = { isDeleted: false }
        ctx.body = await db.wellness.find(conds)
    }

    //  新增健康知识点
    async createHospitalWellnessAPI(ctx, next) {
        // await this.validatePermission(ctx, 4)
        const { title, content, imgUrl } = ctx.state.params
        const data = {
            title,
            content,
            imgUrl
        }

        ctx.body = await db.wellness.create(data)
    }

    //  编辑健康知识点
    async updateHospitalWellnessAPI(ctx, next) {
        // await this.validatePermission(ctx, 4)
        const { title, content, imgUrl, _id } = ctx.state.params
        const data = {
            title,
            content,
            imgUrl,
            updated: new Date()
        }

        ctx.body = await db.wellness.findOneAndUpdate(
            { _id },
            data,
            { upsert: true, new: true }
        )
    }

    //  删除健康知识点
    async deleteHospitalWellnessAPI(ctx, next) {
        // await this.validatePermission(ctx, 4)
        const { _id } = ctx.state.params
        const data = {
            isDeleted: true,
            updated: new Date()
        }

        ctx.body = await db.wellness.findOneAndUpdate(
            { _id },
            data,
            { upsert: true, new: true }
        )
    }

    //  获取党建列表
    async getHospitalPartyBuildingAPI(ctx, next) {
        // await this.validatePermission(ctx, 5)
        const conds = { isDeleted: false }
        ctx.body = await db.partybuilding.find(conds)
    }

    //  新增党建
    async createHospitalPartyBuildingAPI(ctx, next) {
        // await this.validatePermission(ctx, 5)
        const { title, content, imgUrl } = ctx.state.params
        const data = {
            title,
            content,
            imgUrl
        }

        ctx.body = await db.partybuilding.create(data)
    }

    //  编辑党建
    async updateHospitalPartyBuildingAPI(ctx, next) {
        // await this.validatePermission(ctx, 5)
        const { title, content, imgUrl, _id } = ctx.state.params
        const data = {
            title,
            content,
            imgUrl,
            updated: new Date()
        }

        ctx.body = await db.partybuilding.findOneAndUpdate(
            { _id },
            data,
            { upsert: true, new: true }
        )
    }

    //  删除党建
    async deleteHospitalPartyBuildingAPI(ctx, next) {
        // await this.validatePermission(ctx, 5)
        const { _id } = ctx.state.params
        const data = {
            isDeleted: true,
            updated: new Date()
        }

        ctx.body = await db.partybuilding.findOneAndUpdate(
            { _id },
            data,
            { upsert: true, new: true }
        )
    }

    //  操作权限校验
    async validatePermission(ctx, authority) {
        const userAuthority = ctx.state.user.authority
        if(_.indexOf(userAuthority,authority) < 0){
            throw createErr(403, '无操作权限')
        }
    }

    //  获取问卷列表
    async getQuestionnairesAPI(ctx, next) {
        const { type, startDate, endDate, name } = ctx.state.params
        let conds = { isDeleted: false }
        if(type) conds.type = type
        if(name) conds.name = {"name": {$regex: name }}
        if(startDate) conds.created = { "$gte": startDate }
        if(endDate) conds.created = { "$lte": endDate }
        if(startDate && endDate) conds.created = { "$gte": startDate, "$lte": endDate }
        console.log("aaaa",conds)
        ctx.body = await db.questionnaire.find(conds)
    }

    //  获取病历复印列表
    async getMedicalRecordCopyAPI(ctx, next) {
        const { startDate, endDate, name, isSend } = ctx.state.params
        if(isSend) conds.isSend = isSend
        if(name) conds.name = `/${name}/`
        if(startDate) conds.created = { "$gte": startDate }
        if(endDate) conds.created = { "$lte": endDate }
        if(startDate && endDate) conds.created = { "$gte": startDate, "$lte": endDate }

        ctx.body = await db.record.find(conds)
    }

    //  导出Excel
    async exportExcel(ctx, next) {
        const { type, startDate, endDate, name } = ctx.state.params
        let conds = { type: type, isDeleted: false }
        if(name) conds.name = `/${name}/`
        if(startDate) conds.created = { "$gte": startDate }
        if(endDate) conds.created = { "$lte": endDate }
        if(startDate && endDate) conds.created = { "$gte": startDate, "$lte": endDate }
        let _headers, title
        switch(type) {
            case 'clinic' : {
                title = '诊室'
                _headers = [
                    {
                        caption: '用户',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '联系方式',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '就诊日期',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '科室',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '医生服务态度',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '护士服务态度',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '检查时医生尊重并保护您的隐私',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '您对医生提出询问时，能否耐心解答',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '对医生技术水平的评价',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '对诊室环境、卫生的评价',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '对就诊秩序的评价',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '本次就诊有无送过红包',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '医生有无指定药店购药',
                        type: 'string',
                        width: 20
                    },  
                    {
                        caption: '等候就诊时间',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '诊疗过程中值得表扬的方面',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '需要改进的地方',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '评价日期',
                        type: 'string',
                        width: 20
                    }
                ]
                break
            }
            case 'toll' : {
                title = '收费处'
                _headers = [
                    {
                        caption: '用户',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '联系方式',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '就诊日期',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '对收费人员服务态度',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '对收费人员的工作效率',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '对充值缴费方式',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '对挂号收费秩序',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '排队等候时间',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '值得表扬的方面',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '需要改进的地方',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '评价日期',
                        type: 'string',
                        width: 20
                    }
                ]
                break
            }
            case 'pharmacy' : {
                title = '药房'
                _headers = [
                    {
                        caption: '用户',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '联系方式',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '就诊日期',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '对药房人员服务态度',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '药房人员的工作效率',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '对药品齐全是否满意',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '药房人员对您的用药指导',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '对取药秩序是否满意',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '取药等候时间',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '值得表扬的方面',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '需要改进的地方',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '评价日期',
                        type: 'string',
                        width: 20
                    }
                ]
                break
            }
            case 'laboratory' : {
                title = '检验科'
                _headers = [
                    {
                        caption: '用户',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '联系方式',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '就诊日期',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '对检验科人员服务态度',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '对医技人员的技术',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '对检验秩序是否满意',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '对自助打印报告单是否满意',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '您在就医过程中有无遇到医务人员私收现金现象',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '化验排队等候时间',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '值得表扬的方面',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '需要改进的地方',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '评价日期',
                        type: 'string',
                        width: 20
                    }
                ]
                break
            }
            case 'radiology' : {
                title = '放射科'
                _headers = [
                    {
                        caption: '用户',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '联系方式',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '就诊/入院日期',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '医技人员服务态度',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '医技人员尊重并保护您的隐私',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '对检查时的告知配合',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '对医技人员的技术是否满意',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '对检查秩序是否满意',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '您在就医过程中有无遇到医务人员私收现金现象',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '检查排队等候时间',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '值得表扬的方面',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '需要改进的地方',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '评价日期',
                        type: 'string',
                        width: 20
                    }
                ]
                break
            }
            case 'ultrasound' : {
                title = '超声科'
                _headers = [
                    {
                        caption: '用户',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '联系方式',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '就诊/入院日期',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '分诊护士服务态度',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '医技人员服务态度',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '医技人员尊重并保护您的隐私',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '对检查时的告知配合',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '对医技人员的技术是否满意',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '对检查秩序是否满意',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '您在就医过程中有无遇到医务人员私收现金现象',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '检查排队等候时间',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '值得表扬的方面',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '需要改进的地方',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '评价日期',
                        type: 'string',
                        width: 20
                    }
                ]
                break
            }
            case 'endoscopy' : {
                title = '内镜中心'
                _headers = [
                    {
                        caption: '用户',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '联系方式',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '就诊/入院日期',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '护士服务态度',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '医生服务态度',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '医技人员尊重并保护您的隐私',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '您对医务人员耐心解释检查、治疗方法和注意事项的满意度',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '对医生技术水平的评价',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '对诊室环境、卫生的评价',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '对检查秩序是否满意',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '您在就医过程中有无遇到医务人员私收现金现象',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '检查排队等候时间',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '值得表扬的方面',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '需要改进的地方',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '评价日期',
                        type: 'string',
                        width: 20
                    }
                ]
                break
            }
            case 'in-patient' : {
                title = '住院部'
                _headers = [
                    {
                        caption: '用户',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '联系方式',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '就诊/入院日期',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '对医务人员服务态度是否满意',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '对就医流程是否满意',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '对医生的诊疗技术是否满意',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '对护士的技术操作是否满意',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '对住院的治疗效果是否满意',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '对医院的环境、设施、卫生等后勤是否满意',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '对我院治理红包的力度是否满意',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '在就诊期间医务人员有没有收受您的红包',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '对我院的意见和建议',
                        type: 'string',
                        width: 20
                    },
                    {
                        caption: '评价日期',
                        type: 'string',
                        width: 20
                    }
                ]
                break
            }
        }
      
        let rows = await this.getQuestionnaireDate(conds)
        const result = await excel.exportExcel(_headers, rows)
        const data = new Buffer(result, 'binary')
        ctx.set('Content-Type', 'application/vnd.openxmlformats;charset=utf8')
        ctx.set("Content-Disposition", "attachment; filename=" + urlencode(title) + ".xlsx")
        ctx.body = data
    }

    //  获取问卷数据
    async getQuestionnaireDate(conds) {
        let data = []
        let excelData = []
        const questionnaires = await db.questionnaire.find(conds).lean()
        
        switch(conds.type) {
            case 'clinic' : {
                for(let questionnaire of questionnaires) {
                    data.push(questionnaire.name)
                    data.push(questionnaire.tel)
                    data.push((questionnaire.date).toLocaleString())
                    data.push(questionnaire.answer[10]['content'])
                    data.push(`${questionnaire.answer[0]['score']} / ${questionnaire.answer[0]['content']} ${ _.isUndefined(questionnaire.answer[0]['comment']) ? '' : '/ '+questionnaire.answer[0]['comment']}`)
                    data.push(`${questionnaire.answer[1]['score']} / ${questionnaire.answer[1]['content']} ${ _.isUndefined(questionnaire.answer[1]['comment']) ? '' : '/ '+questionnaire.answer[1]['comment']}`)
                    data.push(`${questionnaire.answer[2]['score']} / ${questionnaire.answer[2]['content']} ${ _.isUndefined(questionnaire.answer[2]['comment']) ? '' : '/ '+questionnaire.answer[2]['comment']}`)
                    data.push(`${questionnaire.answer[3]['score']} / ${questionnaire.answer[3]['content']} ${ _.isUndefined(questionnaire.answer[3]['comment']) ? '' : '/ '+questionnaire.answer[3]['comment']}`)
                    data.push(`${questionnaire.answer[4]['score']} / ${questionnaire.answer[4]['content']} ${ _.isUndefined(questionnaire.answer[4]['comment']) ? '' : '/ '+questionnaire.answer[4]['comment']}`)
                    data.push(`${questionnaire.answer[5]['score']} / ${questionnaire.answer[5]['content']} ${ _.isUndefined(questionnaire.answer[5]['comment']) ? '' : '/ '+questionnaire.answer[5]['comment']}`)
                    data.push(`${questionnaire.answer[6]['score']} / ${questionnaire.answer[6]['content']} ${ _.isUndefined(questionnaire.answer[6]['comment']) ? '' : '/ '+questionnaire.answer[6]['comment']}`)
                    data.push(`${questionnaire.answer[7]['score']} / ${questionnaire.answer[7]['content']}`)
                    data.push(`${questionnaire.answer[8]['score']} / ${questionnaire.answer[8]['content']}`)
                    data.push(`${ _.isEmpty(questionnaire.answer[9]['comment']) ? questionnaire.answer[9]['content'] : questionnaire.answer[9]['comment']}`)
                    data.push(questionnaire.advantage)
                    data.push(questionnaire.defect)
                    data.push((questionnaire.created).toLocaleString())
                    excelData.push(data)
                    data = []
                }
                break
            }
            case 'toll' : {
                for(let questionnaire of questionnaires) {
                    data.push(questionnaire.name)
                    data.push(questionnaire.tel)
                    data.push((questionnaire.date).toLocaleString())
                    data.push(`${questionnaire.answer[0]['score']} / ${questionnaire.answer[0]['content']} ${ _.isUndefined(questionnaire.answer[0]['comment']) ? '' : '/ '+questionnaire.answer[0]['comment']}`)
                    data.push(`${questionnaire.answer[1]['score']} / ${questionnaire.answer[1]['content']} ${ _.isUndefined(questionnaire.answer[1]['comment']) ? '' : '/ '+questionnaire.answer[1]['comment']}`)
                    data.push(`${questionnaire.answer[2]['score']} / ${questionnaire.answer[2]['content']} ${ _.isUndefined(questionnaire.answer[2]['comment']) ? '' : '/ '+questionnaire.answer[2]['comment']}`)
                    data.push(`${questionnaire.answer[3]['score']} / ${questionnaire.answer[3]['content']} ${ _.isUndefined(questionnaire.answer[3]['comment']) ? '' : '/ '+questionnaire.answer[3]['comment']}`)
                    data.push(`${ _.isEmpty(questionnaire.answer[4]['comment']) ? questionnaire.answer[4]['content'] : questionnaire.answer[4]['comment']}`)
                    data.push(questionnaire.advantage)
                    data.push(questionnaire.defect)
                    data.push((questionnaire.created).toLocaleString())
                    excelData.push(data)
                    data = []
                }
                break
            }
            case 'pharmacy' : {
                for(let questionnaire of questionnaires) {
                    data.push(questionnaire.name)
                    data.push(questionnaire.tel)
                    data.push((questionnaire.date).toLocaleString())
                    data.push(`${questionnaire.answer[0]['score']} / ${questionnaire.answer[0]['content']} ${ _.isUndefined(questionnaire.answer[0]['comment']) ? '' : '/ '+questionnaire.answer[0]['comment']}`)
                    data.push(`${questionnaire.answer[1]['score']} / ${questionnaire.answer[1]['content']} ${ _.isUndefined(questionnaire.answer[1]['comment']) ? '' : '/ '+questionnaire.answer[1]['comment']}`)
                    data.push(`${questionnaire.answer[2]['score']} / ${questionnaire.answer[2]['content']} ${ _.isUndefined(questionnaire.answer[2]['comment']) ? '' : '/ '+questionnaire.answer[2]['comment']}`)
                    data.push(`${questionnaire.answer[3]['score']} / ${questionnaire.answer[3]['content']} ${ _.isUndefined(questionnaire.answer[3]['comment']) ? '' : '/ '+questionnaire.answer[3]['comment']}`)
                    data.push(`${questionnaire.answer[4]['score']} / ${questionnaire.answer[4]['content']} ${ _.isUndefined(questionnaire.answer[4]['comment']) ? '' : '/ '+questionnaire.answer[3]['comment']}`)
                    data.push(`${ _.isEmpty(questionnaire.answer[5]['comment']) ? questionnaire.answer[5]['content'] : questionnaire.answer[5]['comment']}`)
                    data.push(questionnaire.advantage)
                    data.push(questionnaire.defect)
                    data.push((questionnaire.created).toLocaleString())
                    excelData.push(data)
                    data = []
                }
                break
            }
            case 'laboratory' : {
                for(let questionnaire of questionnaires) {
                    data.push(questionnaire.name)
                    data.push(questionnaire.tel)
                    data.push((questionnaire.date).toLocaleString())
                    data.push(`${questionnaire.answer[0]['score']} / ${questionnaire.answer[0]['content']} ${ _.isUndefined(questionnaire.answer[0]['comment']) ? '' : '/ '+questionnaire.answer[0]['comment']}`)
                    data.push(`${questionnaire.answer[1]['score']} / ${questionnaire.answer[1]['content']} ${ _.isUndefined(questionnaire.answer[1]['comment']) ? '' : '/ '+questionnaire.answer[1]['comment']}`)
                    data.push(`${questionnaire.answer[2]['score']} / ${questionnaire.answer[2]['content']} ${ _.isUndefined(questionnaire.answer[2]['comment']) ? '' : '/ '+questionnaire.answer[2]['comment']}`)
                    data.push(`${questionnaire.answer[3]['score']} / ${questionnaire.answer[3]['content']} ${ _.isUndefined(questionnaire.answer[3]['comment']) ? '' : '/ '+questionnaire.answer[3]['comment']}`)
                    data.push(`${questionnaire.answer[4]['score']} / ${questionnaire.answer[4]['content']}`)
                    data.push(`${ _.isEmpty(questionnaire.answer[5]['comment']) ? questionnaire.answer[5]['content'] : questionnaire.answer[5]['comment']}`)
                    data.push(questionnaire.advantage)
                    data.push(questionnaire.defect)
                    data.push((questionnaire.created).toLocaleString())
                    excelData.push(data)
                    data = []
                }
                break
            }
            case 'radiology' : {
                for(let questionnaire of questionnaires) {
                    data.push(questionnaire.name)
                    data.push(questionnaire.tel)
                    data.push((questionnaire.date).toLocaleString())
                    data.push(`${questionnaire.answer[0]['score']} / ${questionnaire.answer[0]['content']} ${ _.isUndefined(questionnaire.answer[0]['comment']) ? '' : '/ '+questionnaire.answer[0]['comment']}`)
                    data.push(`${questionnaire.answer[1]['score']} / ${questionnaire.answer[1]['content']} ${ _.isUndefined(questionnaire.answer[1]['comment']) ? '' : '/ '+questionnaire.answer[1]['comment']}`)
                    data.push(`${questionnaire.answer[2]['score']} / ${questionnaire.answer[2]['content']} ${ _.isUndefined(questionnaire.answer[2]['comment']) ? '' : '/ '+questionnaire.answer[2]['comment']}`)
                    data.push(`${questionnaire.answer[3]['score']} / ${questionnaire.answer[3]['content']} ${ _.isUndefined(questionnaire.answer[3]['comment']) ? '' : '/ '+questionnaire.answer[3]['comment']}`)
                    data.push(`${questionnaire.answer[4]['score']} / ${questionnaire.answer[4]['content']} ${ _.isUndefined(questionnaire.answer[4]['comment']) ? '' : '/ '+questionnaire.answer[3]['comment']}`)
                    data.push(`${questionnaire.answer[5]['score']} / ${questionnaire.answer[5]['content']}`)
                    data.push(`${ _.isEmpty(questionnaire.answer[6]['comment']) ? questionnaire.answer[6]['content'] : questionnaire.answer[6]['comment']}`)
                    data.push(questionnaire.advantage)
                    data.push(questionnaire.defect)
                    data.push((questionnaire.created).toLocaleString())
                    excelData.push(data)
                    data = []
                }
                break
            }
            case 'ultrasound' : {
                for(let questionnaire of questionnaires) {
                    data.push(questionnaire.name)
                    data.push(questionnaire.tel)
                    data.push((questionnaire.date).toLocaleString())
                    data.push(`${questionnaire.answer[0]['score']} / ${questionnaire.answer[0]['content']} ${ _.isUndefined(questionnaire.answer[0]['comment']) ? '' : '/ '+questionnaire.answer[0]['comment']}`)
                    data.push(`${questionnaire.answer[1]['score']} / ${questionnaire.answer[1]['content']} ${ _.isUndefined(questionnaire.answer[1]['comment']) ? '' : '/ '+questionnaire.answer[1]['comment']}`)
                    data.push(`${questionnaire.answer[2]['score']} / ${questionnaire.answer[2]['content']} ${ _.isUndefined(questionnaire.answer[2]['comment']) ? '' : '/ '+questionnaire.answer[2]['comment']}`)
                    data.push(`${questionnaire.answer[3]['score']} / ${questionnaire.answer[3]['content']} ${ _.isUndefined(questionnaire.answer[3]['comment']) ? '' : '/ '+questionnaire.answer[3]['comment']}`)
                    data.push(`${questionnaire.answer[4]['score']} / ${questionnaire.answer[4]['content']} ${ _.isUndefined(questionnaire.answer[4]['comment']) ? '' : '/ '+questionnaire.answer[3]['comment']}`)
                    data.push(`${questionnaire.answer[5]['score']} / ${questionnaire.answer[5]['content']} ${ _.isUndefined(questionnaire.answer[5]['comment']) ? '' : '/ '+questionnaire.answer[3]['comment']}`)
                    data.push(`${questionnaire.answer[6]['score']} / ${questionnaire.answer[6]['content']}`)
                    data.push(`${ _.isEmpty(questionnaire.answer[7]['comment']) ? questionnaire.answer[7]['content'] : questionnaire.answer[7]['comment']}`)
                    data.push(questionnaire.advantage)
                    data.push(questionnaire.defect)
                    data.push((questionnaire.created).toLocaleString())
                    excelData.push(data)
                    data = []
                }
                break
            }
            case 'endoscopy' : {
                for(let questionnaire of questionnaires) {
                    data.push(questionnaire.name)
                    data.push(questionnaire.tel)
                    data.push((questionnaire.date).toLocaleString())
                    data.push(`${questionnaire.answer[0]['score']} / ${questionnaire.answer[0]['content']} ${ _.isUndefined(questionnaire.answer[0]['comment']) ? '' : '/ '+questionnaire.answer[0]['comment']}`)
                    data.push(`${questionnaire.answer[1]['score']} / ${questionnaire.answer[1]['content']} ${ _.isUndefined(questionnaire.answer[1]['comment']) ? '' : '/ '+questionnaire.answer[1]['comment']}`)
                    data.push(`${questionnaire.answer[2]['score']} / ${questionnaire.answer[2]['content']} ${ _.isUndefined(questionnaire.answer[2]['comment']) ? '' : '/ '+questionnaire.answer[2]['comment']}`)
                    data.push(`${questionnaire.answer[3]['score']} / ${questionnaire.answer[3]['content']} ${ _.isUndefined(questionnaire.answer[3]['comment']) ? '' : '/ '+questionnaire.answer[3]['comment']}`)
                    data.push(`${questionnaire.answer[4]['score']} / ${questionnaire.answer[4]['content']} ${ _.isUndefined(questionnaire.answer[4]['comment']) ? '' : '/ '+questionnaire.answer[3]['comment']}`)
                    data.push(`${questionnaire.answer[5]['score']} / ${questionnaire.answer[5]['content']} ${ _.isUndefined(questionnaire.answer[5]['comment']) ? '' : '/ '+questionnaire.answer[3]['comment']}`)
                    data.push(`${questionnaire.answer[6]['score']} / ${questionnaire.answer[6]['content']} ${ _.isUndefined(questionnaire.answer[6]['comment']) ? '' : '/ '+questionnaire.answer[3]['comment']}`)
                    data.push(`${questionnaire.answer[7]['score']} / ${questionnaire.answer[7]['content']}`)
                    data.push(`${ _.isEmpty(questionnaire.answer[8]['comment']) ? questionnaire.answer[8]['content'] : questionnaire.answer[8]['comment']}`)
                    data.push(questionnaire.advantage)
                    data.push(questionnaire.defect)
                    data.push((questionnaire.created).toLocaleString())
                    excelData.push(data)
                    data = []
                }
                break
            }
            case 'in-patient' : {
                for(let questionnaire of questionnaires) {
                    data.push(questionnaire.name)
                    data.push(questionnaire.tel)
                    data.push((questionnaire.date).toLocaleString())
                    data.push(`${questionnaire.answer[0]['score']} / ${questionnaire.answer[0]['content']}`)
                    data.push(`${questionnaire.answer[1]['score']} / ${questionnaire.answer[1]['content']}`)
                    data.push(`${questionnaire.answer[2]['score']} / ${questionnaire.answer[2]['content']}`)
                    data.push(`${questionnaire.answer[3]['score']} / ${questionnaire.answer[3]['content']}`)
                    data.push(`${questionnaire.answer[4]['score']} / ${questionnaire.answer[4]['content']}`)
                    data.push(`${questionnaire.answer[5]['score']} / ${questionnaire.answer[5]['content']}`)
                    data.push(`${questionnaire.answer[6]['score']} / ${questionnaire.answer[6]['content']}`)
                    data.push(`${questionnaire.answer[7]['score']} / ${questionnaire.answer[7]['content']}`)
                    data.push(questionnaire.advantage)
                    data.push((questionnaire.created).toLocaleString())
                    excelData.push(data)
                    data = []
                }
                break
            }
        }
        return excelData
    }

    //  上传图片
    async uploadImageAPI(ctx, next) {
        const imgUrl = ctx.req.file.filename
        ctx.body = imgUrl
    }
    
    //  附带科室名称
    async setWithDepartmentName(ctx) {
        let results = ctx.body
        if (!Array.isArray(results)) {
            results = Array(results)
        }
        for(let result of results) {
            result.departmentName = (await db.department.findOne({ _id: result.department }, { title: 1 })).title
        }
    }
}

module.exports = new HospitalCtrl()