const {
    Schema,
    model
} = require('mongoose');

const challengeCategorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    isObsolete: {
        type: Boolean,
        default: false
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
})

module.exports = model('ChallengeCategory', challengeCategorySchema)