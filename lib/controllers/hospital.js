const db = require('limbo').use('hospital')
const { Base } = require('./base')

class HospitalCtrl extends Base {
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

    //  获取新闻列表
    async getHospitalNewsAPI(ctx, next) {
        const conds = { isDeteled: false }
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
            isDeteled: true,
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
        const conds = { isDeteled: false }
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
            isDeteled: true,
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
        const conds = { isDeteled: false }
        ctx.body = await db.department.find(conds)
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

    //  删除科室
    async deleteHospitalDepartmentAPI(ctx, next) {
        const { _id } = ctx.state.params
        const data = {
            isDeteled: true,
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
        const conds = { isDeteled: false }
        ctx.body = await db.doctor.find(conds)
    }

    //  新增医生
    async createHospitalDoctorAPI(ctx, next) {
        const { title, content, imgUrl, department } = ctx.state.params
        const data = {
            title,
            content,
            imgUrl,
            department
        }

        ctx.body = await db.doctor.create(data)
    }

    //  编辑医生
    async updateHospitalDoctorAPI(ctx, next) {
        const { title, content, imgUrl, _id, department } = ctx.state.params
        const data = {
            title,
            content,
            imgUrl,
            department,
            updated: new Date()
        }

        ctx.body = await db.doctor.findOneAndUpdate(
            { _id },
            data,
            { upsert: true, new: true }
        )
    }

    //  删除医生
    async deleteHospitalDoctorAPI(ctx, next) {
        const { _id } = ctx.state.params
        const data = {
            isDeteled: true,
            updated: new Date()
        }

        ctx.body = await db.doctor.findOneAndUpdate(
            { _id },
            data,
            { upsert: true, new: true }
        )
    }

    //  获取健康知识点列表
    async getHospitalWellnessAPI(ctx, next) {
        const conds = { isDeteled: false }
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
            isDeteled: true,
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
        const conds = { isDeteled: false }
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
            isDeteled: true,
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
}

module.exports = new HospitalCtrl()