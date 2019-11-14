const {
    Schema,
    model
} = require('mongoose')
const messageSchema = new Schema({
    _chatRoom: {
        type: Schema.Types.ObjectId,
        ref: 'ChatRoom'
    },
    content: {
        type: Schema.Types.Mixed
    },
    isImage: {
        type: Boolean
    },
    authorModel: {
        type: String,
        required: true,
        enum: ['Coach', 'Coachee']
    },
    author: {
        type: Schema.Types.ObjectId,
        refPath: 'authorModel'
    }
}, {
    timestamps: {
        createdAt: 'createdAt'
    }
})

module.exports = model('Message', messageSchema)