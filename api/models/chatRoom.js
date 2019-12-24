const {
    Schema,
    model
} = require('mongoose');

const chatRoomSchema = new Schema({
    name: {
        type:String
    },
    participants: [{
        participantModel: {
            type: String,
            required: true,
            enum: ['Coach' ,'Coachee']
        },
        participant: {
            type: Schema.Types.ObjectId,
            refPath: 'participants.participantModel'
        }
    }],
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
})

module.exports = model('ChatRoom', chatRoomSchema)