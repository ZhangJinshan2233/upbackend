const {
    Schema,
    model
} = require('mongoose')

companyCodeSchema = new Schema({
    companyName: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    numberOfMembers:{
        type:Number,
        default:0
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
        createdAt: "createdAt"
    }
})

module.exports = model('CompanyCode', companyCodeSchema)