const {
    ChatRoom,
    Message,
    Coach,
    Coachee
} = require('../models');

let go_to_chat_room = async (req, res) => {
    let {
        roomName: name
    } = req.params
    let chatRoom = {}
    chatRoom = await ChatRoom.findOne({
        name
    })
    if (!chatRoom) {
        // let coachee = await Coachee.findById(name)
        // let participants = [];
        // participants.push({
        //     participantModel: 'Coachee',
        //     participant: name
        // })
        // participants.push({
        //     participantModel: 'Coach',
        //     participant: coachee._coach
        // })
        chatRoom = await ChatRoom.create({
            name,
            // participants
        });
    }
    res.status(200).json({
        chatRoom
    })
}
let create_message = async (req, res) => {
    let {
        chatRoomId: _chatRoom,
        content,
        isImage,
        authorModel,
        author
    } = req.body
    let messageContent = "";
    if (isImage) {
        messageContent = Buffer.from(content, 'base64')
    } else {
        messageContent = content
    }

    await Message.create({
        _chatRoom,
        content: messageContent,
        isImage,
        authorModel,
        author
    })
    res.status(200).json({
        message: "created message successfully"
    })
}

let get_messages_pagination_by_chatRoom = async (req, res) => {
    let convertedMessages = []
    let {
        chatRoomId: _chatRoom
    } = req.params
    let skipNum = parseInt(req.query.skipNum);
    let recordSize = 3;
    messages = await Message.find({
            _chatRoom
        })
        .sort({
            createdAt: -1
        })
        .skip(skipNum)
        .limit(recordSize)
        .populate('author', 'firstName lastName')
    if (messages.length > 0) {
        convertedMessages = messages.reduce((acc, current) => {
            let convertedMessage = {
                name: current.author.firstName + " " + current.author.lastName,
                content: current.content,
                author: current.author._id,
                createdAt: current.createdAt,
                isImage: current.isImage
            }
            return [convertedMessage, ...acc]
        }, [])
    }
    res.status(200).json({
        messages: convertedMessages
    })
}
module.exports = {
    go_to_chat_room,
    create_message,
    get_messages_pagination_by_chatRoom
}