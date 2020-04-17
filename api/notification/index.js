const OneSignal = require('onesignal-node');
const config = require('../config')

const {
    Notification,
    Client,
} = OneSignal;
let NotificationClient = new Client({});

NotificationClient.setApp({
    appAuthKey: config.notificationAuth.appAuthKey,
    appId: config.notificationAuth.appId
});

NotificationClient.userAuthKey = config.notificationAuth.userAuthKey;
/**
 * 
 * @param {*} name 
 * @param {*} recipientId 
 * @param {*} notificationContent 
 */
let send_notification = (name, recipientId, notificationContent) => {

    let notification = new Notification({
        content_available: true
    });
    notification.postBody['contents'] = {
        "en": notificationContent,
    };
    // notification.postBody['data'] = {
    //     "notificationType": "message"
    // }
    notification.postBody["headings"] = {
        "en": name,
    }

    notification.postBody["filters"] = [{
        "field": "tag",
        "key": "userID",
        "relation": "=",
        "value": recipientId
    }];

    NotificationClient.sendNotification(notification)
        .then(function (response) {

        })
        .catch(function (err) {
            console.log('Something went wrong...', err);
            throw err

        });

}

module.exports = {
    send_notification
}