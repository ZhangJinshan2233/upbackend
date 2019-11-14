const OneSignal = require('onesignal-node');
const config = require('../config')

const {
    Notification,
    Client,
} = OneSignal;
let NotificationClient = new Client({});

NotificationClient.setApp({
    appAuthKey: "NWQ5OGU0NGQtY2ZmYS00NjAzLWIyMWMtYWEwNGIzNmM5ODI2",
    appId: "2679e88f-acf0-4ea1-a42a-35fbff80ff9f"
});

NotificationClient.userAuthKey = "ZDE3MjliMzQtMTQxMC00YzU2LWI4YTMtNzA1Njg3NTE4MzE0";

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