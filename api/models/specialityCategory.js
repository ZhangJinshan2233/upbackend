const {
    Schema
} = require('mongoose')
const Category = require('./category')
const SpecialityCategory = Category.discriminator('SpecialityCategory', new Schema())

module.exports = SpecialityCategory