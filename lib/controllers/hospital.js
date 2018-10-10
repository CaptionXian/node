const db = require('limbo').use('hospital')
const { Base } = require('./base')
const jsonify = require('../utils/jsonify')
const ObjectId = require('mongoose').Types.ObjectId
const _ = require('lodash')
const createErr = require('http-errors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')

class HospitalCtrl extends Base {
    //  登录
    async loginHospitalAPI(ctx, next) {
        const { userName, passWord } = ctx.state.params
        const conds = {
            userName: userName.trim(),
            isDeleted: false
        }
        const user = await db.user.findOne(conds)
        if(!user)throw createErr(400, '用户不存在')
        if(!bcrypt.compareSync(passWord.trim(), user.passWord)){
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
                _id: user._id
            },
            config.AUTH.SECRET,
            { expiresIn: config.AUTH.EXPIRES }
        )

        const data = {
            token,
            lastLoginTime: new Date()
        }

        db.user.findOneAndUpdate(
            { _id: ObjectId(user._id) },
            data
        )

        user.token = token
    }

    //  登出
    async logoutHospitalAPI(ctx, next) {
        const { _id } = ctx.state.params
        c
    }

    //  新增用户
    async createHospitalUserAPI(ctx, next) {
        const { userName, passWord } = ctx.state.params
        const salt = bcrypt.genSaltSync(10)
        const conds = {
            userName: userName.trim(),
            isDeleted: false
        }
        const user = await db.user.findOne(conds)
        if(user)throw createErr(400, '用户名已存在')

        const data = {
            userName: userName.trim(),
            passWord: bcrypt.hashSync(passWord.trim(), salt)
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
        const { userName, passWord, _id } = ctx.state.params
        const salt = bcrypt.genSaltSync(10)
        const data = _.omitBy(
            {
                userName: userName.trim(),
                passWord: bcrypt.hashSync(passWord.trim(), salt),
                updated: new Date()
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
        const summary = await db.hospital.find()
        ctx.body = summary
    }

    //  更新简介
    async updateHospitalSummaryAPI(ctx, next) {
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
    

    //  获取新闻列表
    async getHospitalNewsAPI(ctx, next) {
        const conds = { isDeleted: false }
        ctx.body = await db.news.find(conds)
    }

    //  新增新闻
    async createHospitalNewsAPI(ctx, next) {
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
        const conds = { isDeleted: false }
        ctx.body = await db.banner.find(conds)
    }
    
    //  新增轮播图
    async createHospitalBannerAPI(ctx, next) {
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
        const conds = { isDeleted: false }
        ctx.body = await db.department.find(conds).sort({ sort: 1 })
    }

    //  新增科室
    async createHospitalDepartmentAPI(ctx, next) {
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
        const { _id } = ctx.state.params
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
        const { _id } = ctx.state.params
        const conds = { department: _id, isDeleted: false }
        ctx.body = await db.doctor.find(conds)

        await jsonify(ctx)
        await this.setWithDepartmentName(ctx)
    }

    //  新增医生
    async createHospitalDoctorAPI(ctx, next) {
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
        const conds = { isDeleted: false }
        ctx.body = await db.wellness.find(conds)
    }

    //  新增健康知识点
    async createHospitalWellnessAPI(ctx, next) {
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
        const conds = { isDeleted: false }
        ctx.body = await db.partybuilding.find(conds)
    }

    //  新增党建
    async createHospitalPartyBuildingAPI(ctx, next) {
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