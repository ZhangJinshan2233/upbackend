'use strict'
const {
    Schema,
    model
} = require('mongoose');
const ProgrammeRecordSchema = new Schema({
    _coachee: {
        type: Schema.Types.ObjectId,
        ref: 'Coachee',
    },
    _scheduledProgramme: {
        type: Schema.Types.ObjectId,
        ref: 'ScheduledProgramme',
    },
    isJoined:{
        type: Boolean,
        default: false
    },
    isObsolete: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }

})

module.exports = model('ProgrammeRecord', ProgrammeRecordSchema)