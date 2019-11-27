const {
    Schema
} = require('mongoose')
const Category = require('./category')
const MembershipCategory = Category.discriminator('MembershipCategory', new Schema({
    duration:{
        type: Number,
        required: true,
        default: 7
    },
    cost: {
        type: Number,
        required: true,
        default: 0
    },
    type: {
        type: String,
        required: true,
        default: ''
    }
}))

module.exports = MembershipCategory