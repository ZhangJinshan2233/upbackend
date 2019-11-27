const {
    Schema
} = require('mongoose')
const Category = require('./category')
const HabitCategory = Category.discriminator('HabitCategory', new Schema({
    group: {
        type: String,
        required: true
    }
}))

module.exports = HabitCategory