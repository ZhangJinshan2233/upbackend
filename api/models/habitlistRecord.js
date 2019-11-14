'use strict'
const {
    Schema,
    model
} = require('mongoose');
const habitlistRecordSchema = new Schema({
    _coachee: {
        type: Schema.Types.ObjectId,
        ref: 'Coachee'
    },
    createDate: {
        type: Date,
        default: Date.now
    },
    habits: [{
        name: {
            type: String
        },
        status: {
            type: Boolean,
            default: false
        },
        _id: false
    }]
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
})

module.exports = model('HabitlistRecord', habitlistRecordSchema)