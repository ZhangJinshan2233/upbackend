const {
    Schema,
    model
} = require('mongoose');

const ProgrammeShema = new Schema({
    name: {
        type: String,
        required: true
    },
    poster: {
        type: String,
        required: true
    },
    video: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    difficulty: {
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
module.exports = model('Programme', ProgrammeShema)