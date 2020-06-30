const {
    Schema,
    model
} = require('mongoose')
const autopopulate = require('mongoose-autopopulate')
const SlumberTimeJournalPostSchema = new Schema({
    fallAsleepTime: {
        type: Date,
        required: true
    },
    wakeUpTime: {
        type: Date,
        required: true
    },

    napDurationMins: {
        type: String
    },
    currentMood: {
        type: String
    },
    caffeineConsumed: {
        type: String,
        default: 0
    },
    comments: [{
        _coachee: {
            type: Schema.Types.ObjectId,
            default: null,
            ref: 'Coachee',
            autopopulate: {
                select: 'firstName lastName imgType imgData'
            }
        },
        _coach: {
            type: Schema.Types.ObjectId,
            default: null,
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
            required: true
        }
    }],
    createDate:{
        type: Date,
        default: Date.now
    },
    rating: {
        type: Number,
        default: 0
    }
})
SlumberTimeJournalPostSchema.plugin(autopopulate)
module.exports = model('SlumberTimeJournalPost', SlumberTimeJournalPostSchema)