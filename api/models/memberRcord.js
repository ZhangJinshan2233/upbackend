const {
    Schema,
    model
} = require('mongoose')

memberRecordSchema = new Schema({
    _coachee: {
        type: Schema.Types.ObjectId,
        ref: 'Coachee'
    },
    memberships:[{
        _membership:{
            type:Schema.Types.ObjectId,
            ref:'Membership'
        }
    }],
    expireAt: {
        type: Date,
        default: Date.now,
        index: {
            expireAfterSeconds: 0
        }
    }
}, {
    timestamps: {
        createdAt: "createdAt"
    }
})

module.exports = model('MemberRecord', memberRecordSchema)