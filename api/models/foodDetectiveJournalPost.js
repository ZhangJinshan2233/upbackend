const {
    Schema,
    model
} = require('mongoose')
const autopopulate = require('mongoose-autopopulate')
const foodDetectiveJournalPostSchema = new Schema({
    mealCategory: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    imgData: {
        type: Buffer,
        default: null
    },
    imgType: {
        type: String,
        default: 'image/jpeg'
    },
    createDate: {
        type: Date,
        default: Date.now
    },
    comments: [{
        _coachee: {
            type: Schema.Types.ObjectId,
            default:null,
            ref: 'Coachee',
            autopopulate: {
                select: 'firstName lastName imgType imgData'
            }
        },
        _coach: {
            type: Schema.Types.ObjectId,
            default:null,
            ref: 'Coach',
            autopopulate: {
                select: 'firstName lastName imgType imgData'
            }
        },
        content: {
            type: String
        },
        isCoach: {
            type: Boolean,
            default: false
        },
        createDate: {
            type: Date,
            required:true
        }
    }],
    rating: {
        type: Number,
        default: 0
    }
})
foodDetectiveJournalPostSchema.plugin(autopopulate)
module.exports = model('FoodDetectiveJournalPost', foodDetectiveJournalPostSchema)