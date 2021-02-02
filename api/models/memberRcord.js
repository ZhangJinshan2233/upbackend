const {
    Schema,
    model
} = require('mongoose')
MemberRecordSchema = new Schema({
    isActivated: {
        type: Boolean,
        default: true
    },
    userModel: {
        type: String,
        required: true,
        enum:['Coachee','CorporateAdmin']
    },
    user: {
        type: Schema.Types.ObjectId,
        refPath: 'userModel'
    },
    expireAt: {
        type: Date,
        default: Date.now,
        index: {
            expireAfterSeconds: 0
        }
    }
}, {
    timestamps: {
        createdAt: 'createdAt'
    }
})
const MemberRecord = model('MemberRecord', MemberRecordSchema)

module.exports = MemberRecord