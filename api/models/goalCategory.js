const {
    Schema
} = require('mongoose')
const Category = require('./category')
const GoalCategory = Category.discriminator('GoalCategory', new Schema())
module.exports = GoalCategory