const {
    Schema,
    model
} = require('mongoose')
const challengeSchema = new Schema({
    _challengeCategory: {
        type: Schema.Types.ObjectId,
        ref: 'ChallengeCategory'
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
module.exports = model('Challenge', challengeSchema)