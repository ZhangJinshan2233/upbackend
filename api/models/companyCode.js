const {
    Schema,
    model
} = require('mongoose')

companyCodeSchema = new Schema({
    companyName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default:""
    },
    code: {
        type: String,
        required: true
    },
    isObsolete: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: {
        createdAt: "createdAt"
    }
})

module.exports = model('CompanyCode', companyCodeSchema)