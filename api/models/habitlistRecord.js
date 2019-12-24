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
        _habit: {
            type: Schema.Types.ObjectId,
            ref: 'Habit',
            required:true
        },
        status: {
            type: Boolean,
            default: false
        }
    }]
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
})

module.exports = model('HabitlistRecord', habitlistRecordSchema)