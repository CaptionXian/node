const config = require('config')
const limbo = require('limbo')
const mongoose = require('mongoose')
const schemas = require('../models')(mongoose.Schema)
mongoose.Promise = Promise

let dbOptions = {
    useNewUrlParser: true
}

let db = limbo.use(config.MONGODB.DB, {
    provider: 'mongo',
    conn: mongoose.createConnection(config.MONGODB.URL, dbOptions),
    schemas
})

module.exports = { db }