const {
    Schema,
    model
} = require('mongoose');

const GcpMediaSchema = new Schema({
    originalname: {
        type: String,
        default: ''
    },
    filepath: {
        type: String,
        default: ''
    },
    status: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
})
const GcpMedia = model('GcpMedia', GcpMediaSchema)
module.exports = GcpMedia