const {
    Schema
} = require('mongoose')
const Category = require('./category')
const AppVersionCategory = Category.discriminator('AppVersionCategory', new Schema({
    version:{
        type:String,
        required:true
    }
}))

module.exports = AppVersionCategory