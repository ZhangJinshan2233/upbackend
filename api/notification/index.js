const OneSignal = require('onesignal-node');
const {
    notificationAuth
} = require('../config')

const {
    Client
} = OneSignal;

const {
    appId,
    appAuthKey
} = notificationAuth

const NotificationClient = new Client(appId, appAuthKey);

/**
 * 
 * @param {*} name 
 * @param {*} recipientId 
 * @param {*} notificationContent 
 */
let send_notification = async (name, recipientId, notificationContent) => {
    const notification = {
        contents: {
            'en': notificationContent
        },
        headings: {
            "en": name
        },
        filters: [{
            "field": "tag",
            "key": "userID",
            "relation": "=",
            "value": recipientId
        }]
    };
    try {
        const notificationRes = await NotificationClient.createNotification(notification);
        console.log(notificationRes.body.id);
    } catch (e) {
        if (e instanceof OneSignal.HTTPError) {
            // When status code of HTTP response is not 2xx, HTTPError is thrown.
            console.log(e.statusCode);
            console.log(e.body);
        }
    }
}


module.exports = {
    send_notification
}