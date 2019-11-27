const {
    Schema,
    model
} = require('mongoose')

const noteSchema = new Schema({
    _coachee: {
        type: Schema.Types.ObjectId,
        ref: 'Coachee',
        required:true
    },
    title: {
        type: String,
        required: true,
        default: ""
    },
    discussed: {
        type: String,
        required: true,
        default: ""
    },
    concluded: {
        type: String,
        required: true,
        default: ""
    },
    next: {
        type: String,
        required: true,
        default: ""
    },
    isObsolete: {
        type: Boolean,
        default: false
    },
    createdDate: {
        type: Date,
        default: Date.now
    }
})

module.exports=model('Note',noteSchema)