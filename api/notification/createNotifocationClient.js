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

module.exports = new Client(appId, appAuthKey);