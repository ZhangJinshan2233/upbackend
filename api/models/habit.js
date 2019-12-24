'use strict'
const {
    Schema,
    model
} = require('mongoose');
const habitSchema = new Schema({
    _coachee: {
        type: Schema.Types.ObjectId,
        ref: 'Coachee'
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    daysOfWeek: {
        type: [String],
        default: []
    },
    isObsolete: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: {
        createdAt: 'createdAt'
    }
})
module.exports = model('Habit', habitSchema)