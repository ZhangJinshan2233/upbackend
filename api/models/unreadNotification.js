'use strict'
const {
    Schema,
    model
} = require('mongoose');

const UnreadNotificationSchema = new Schema({
    type: {
        type: String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        refPath: 'recipientModel'
    },
    authorModel: {
        type: String,
        required: true,
        enum: ['Coach', 'Coachee']
    },
    recipient: {
        type: Schema.Types.ObjectId,
        refPath: 'recipientModel'
    },
    recipientModel: {
        type: String,
        required: true,
        enum: ['Coach', 'Coachee']
    }
}, {
    timestamps: {
        createdAt: "createdAt"
    }
})

module.exports = model('UnreadNotification', UnreadNotificationSchema)