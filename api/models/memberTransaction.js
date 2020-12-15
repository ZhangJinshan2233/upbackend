const {
    Schema,
    model
} = require('mongoose')
const MemberTransactionSchema = new Schema({
    userModel: {
        type: String,
        required: true,
        enum:['Coachee']
    },
    user: {
        type: Schema.Types.ObjectId,
        refPath: 'userModel'
    },
    assignerModel: {
        type: String,
        required: true,
        enum: ['AdminCoach']
    },
    assigner: {
        type: Schema.Types.ObjectId,
        refPath: 'assignerModel'
    },
    _membershipCategory: {
        type: Schema.Types.ObjectId,
        ref: 'MembershipCategory'
    }
}, {
    timestamps: {
        createdAt: 'createdAt'
    }
})

const MemberTransaction = model('MemberTransaction', MemberTransactionSchema)
module.exports = MemberTransaction