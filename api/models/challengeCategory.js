const {
    Schema
} = require('mongoose');
const Category = require('./category')
const ChallengeCategory = Category.discriminator('ChallengeCategory', new Schema({
    duration: {
        type: Number,
        required: true
    },
    isFree: {
        type: Boolean,
        default: true
    },
    imgData: {
        type: Buffer
    },
    imgType: {
        type: String,
        default: 'image/jpeg'
    }
}))

module.exports = ChallengeCategory