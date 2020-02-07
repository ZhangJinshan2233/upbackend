const {
    Schema,
    model
} = require('mongoose')

const HealthyTipSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    grade:{
        type:Number,
        default:0
    },
    imgType: {
        type: String,
        default: 'image/jpeg'
    },
    imgData: {
        type: Buffer,
        default: null
    },
    isObsolete: {
        type: Boolean,
        default: false
    },
    url: {
        type: String,
        default: ""
    }
}, {
    timestamps: {
        createdAt: 'createdAt'
    }
})

module.exports=model('HealthyTip',HealthyTipSchema)