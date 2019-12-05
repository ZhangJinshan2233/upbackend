const {
    Schema
} = require('mongoose')
const Category = require('./category')
const AppCategory = Category.discriminator('AppCategory', new Schema({
    version:{
        type:String,
        required:true
    },
    storeUrl:{
        type:String,
        required:true,
        default:""
    }
}))

module.exports = AppCategory