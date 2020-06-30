const OneSignal = require('onesignal-node');
const NotificationClient = require('./createNotifocationClient')

/**
 * 
 * @param {*} name 
 * @param {*} recipientId 
 * @param {*} notificationContent 
 */
const sendNotification = (subTitle, recipientId, notificationContent) => {
    const notification = {
        headings: {
            "en": subTitle
        },
        contents: {
            'en': notificationContent
        },
        filters: [{
            "field": "tag",
            "key": "userID",
            "relation": "=",
            "value": recipientId
        }]
    };
    return NotificationClient.createNotification(notification);
}

//one to one
const sendGeneralNotification = async (subTitle, recipientId, notificationContent) => {
    try {
        const notificationRes = await sendNotification(subTitle, recipientId, notificationContent)
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
    sendGeneralNotification,
    sendNotification,
}