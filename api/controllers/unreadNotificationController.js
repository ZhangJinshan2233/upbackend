'use strict'

const {
    UnreadNotification
} = require('../models')

let create_unread_notification = (type, author, authorModel, recipient, recipientModel) => {

    UnreadNotification.create({
        type,
        author,
        authorModel,
        recipient,
        recipientModel
    })
}

let get_unread_notifications = async (req, res) => {
    let {
        _id: recipient,
        userType
    } = req.user;
    let {
        author,
        type
    } = req.query
    let unreadNotifications = [];
    
    let authorModel = "Coach";
    let recipientModel = "Coachee"
    if (!userType.includes('Coachee')) {
        authorModel = "Coachee";
        recipientModel = "Coach"
    }
    if (!type) {
        unreadNotifications = await UnreadNotification.find({
            $and: [{
                author
            }, {
                recipient
            }]
        })
    } else {
        unreadNotifications = await UnreadNotification.find({
            $and: [{
                type
            }, {
                author
            }, {
                recipient
            }]
        })
    }
    res.status(200).json({
        unreadNotifications
    })
}

let remove_notifications = async (req, res) => {
    let {
        _id: recipient,
    } = req.user;

    let {
        author,
        type
    } = req.query

    await UnreadNotification.deleteMany({
        $and: [{
            type
        }, {
            recipient
        }, {
            author
        }]
    })
    res.status(200).json({
        message: "removed"
    })
}
module.exports = {
    create_unread_notification,
    get_unread_notifications,
    remove_notifications
}