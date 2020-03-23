'use strict'
const passportMiddleware = require('./passport')
const errorHandler=require('./errorHandler')
module.exports = {
    passportMiddleware,
    errorHandler
}