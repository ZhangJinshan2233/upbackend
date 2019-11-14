'use strict'
const {
    Schema,
    model
} = require('mongoose');
const autopopulate = require('mongoose-autopopulate')
const indicatorRecordSchema = new Schema({

        _coachee: {
            type: Schema.Types.ObjectId,
            ref: 'Coachee',
        },
        _indicator: {
            type: Schema.Types.ObjectId,
            ref: 'Indicator',
            autopopulate: {
                select: 'name group unit'
            }
        },
        value: {
            type: String,
            required: true
        },
        createDate: {
            type: Date,
            required: true
        },
        isObsolete: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt'
        }

    })
indicatorRecordSchema.plugin(autopopulate)
module.exports = model('IndicatorRecord', indicatorRecordSchema)