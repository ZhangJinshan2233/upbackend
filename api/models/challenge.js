const {
    Schema,
    model
} = require('mongoose')
const autopopulate = require('mongoose-autopopulate')
const challengeSchema = new Schema({
    _challengeCategory: {
        type: Schema.Types.ObjectId,
        ref: 'ChallengeCategory',
        autopopulate: {
            select: 'name imgType imgData'
        }
    },
    insightsOfCoach:{
        type:String,
        default:""
    },
    _coachee: {
        type: Schema.Types.ObjectId,
        ref: 'Coachee'
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        default: Date.now
    },
    posts: [{
        _id: false,
        postModel: {
            type: String,
            required: true,
            enum: ['FoodJournalPost']
        },
        _post: {
            type: Schema.Types.ObjectId,
            refPath: 'posts.postModel'
        }
    }],
    isObsolete: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }

})
challengeSchema.plugin(autopopulate)
module.exports = model('Challenge', challengeSchema)