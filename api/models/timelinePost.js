const {
    Schema,
    model
} = require('mongoose')
const autopopulate = require('mongoose-autopopulate')
const timelinePostSchema = new Schema({
    _coachee: {
        type: Schema.ObjectId,
        ref: 'Coachee'
    },
    description: {
        type: String
    },

    postImage: {
        imgType: String,
        data: Buffer
    },
    comments: [{
        _coach: {
            type: Schema.ObjectId,
            ref: 'Coach',
            default: null,
            autopopulate: {
                select: 'firstName lastName profileImage'
            }
        },
        _coachee: {
            type: Schema.ObjectId,
            ref: 'Coachee',
            default: null,
            autopopulate: {
                select: 'firstName lastName profileImage'
            }
        },
        content: {
            type: String
        },
        isCoach: {
            type: Boolean,
            default: false
        },
        createdDate: {
            type: Date
        }
    }],
    rating: {
        type: Number,
        default: 0
    }
}, {
    timestamps: {
        createdAt: "createdDate",
        updatedAt: 'updatedDate'
    }
})
timelinePostSchema.plugin(autopopulate)
timelinePostSchema.query.byCoacheeId = function (coacheeId) {

    return this.where({
        _coachee: coacheeId
    })

}
module.exports = model('TimelinePost', timelinePostSchema)