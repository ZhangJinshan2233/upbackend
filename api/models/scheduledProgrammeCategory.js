const {
    Schema
} = require('mongoose')
const Category = require('./category')
const ScheduledProgrammeCategory = Category.discriminator('ScheduledProgrammeCategory', new Schema({
    posterUrl:{
        type:String,
        required:true,
        default:""
    }
}))

module.exports = ScheduledProgrammeCategory