const {
    Schema,
    model
} = require('mongoose')

membershipSchema = new Schema({
    _coachee: {
        type: Schema.Types.ObjectId,
        ref: 'Coachee'
    },
    _membershipCategory: {
        type: Schema.Types.ObjectId,
        ref: 'MembershipCategory'
    }
},{
    timestamps:{
        createdAt:"createdAt"
    }
})

module.exports = model('Membership', membershipSchema)