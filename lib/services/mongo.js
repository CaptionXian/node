const config = require('config')
const limbo = require('limbo')
const mongoose = require('mongoose')
const schemas = require('../models')(mongoose.Schema)
const bcrypt = require('bcryptjs')
mongoose.Promise = Promise

let dbOptions = {
    useNewUrlParser: true
}

let db = limbo.use(config.MONGODB.DB, {
    provider: 'mongo',
    conn: mongoose.createConnection(config.MONGODB.URL, dbOptions),
    schemas
})

;(async () => {
    const admin = await db.user.find({ userName: 'admin' })
    const salt = bcrypt.genSaltSync(10)
    const data = {
        userName: 'admin',
        passWord: bcrypt.hashSync('admin', salt),
        authority: [0,1,2,3,4,5],
        isAdmin: true
    }
    if(!admin.length)db.user.create(data)
})()


module.exports = { db }