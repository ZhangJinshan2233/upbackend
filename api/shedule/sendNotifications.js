const TaskQueue = require('./taskQueue')
const notificationComponent = require('../notification')
module.exports = (notifiedUsersService) => {
    notifications = {};
    notifications.sendNoPostUsersForNutritionChallenge = async () => {
        const notificationQueue = new TaskQueue(50);
        let noPostUsers = await notifiedUsersService.findNoPostUsersForNutritionChallenge()
        if (!noPostUsers.length) {
            console.log('no available users')
            return
        } else {
            noPostUsers.forEach(user => {
                subTitle = 'Food Detective';
                notificationContent = `Seems like you\'re busy today\! Take just 1min to post about your meal so that your coach can review it\?`
                let task = () => {
                    return notificationComponent.sendNotification(subTitle, user, notificationContent)
                }
                notificationQueue.pushTask(task)
            })
        }
    }

    notifications.sendExpiredUsersForNutritionChanllenge = async () => {
        const notificationQueue = new TaskQueue(50);
        let expiredUsers = await notifiedUsersService.findExpiredUsersYesterday()
        if (!expiredUsers.length) {
            console.log('no available users')
            return
        } else {
            expiredUsers.forEach(user => {
                subTitle = 'Food Detective';
                notificationContent = `Congrats\, you\'ve completed the Food Detective challenge\! Your coach will review your diet with you soon\.`
                let task = () => {
                    return notificationComponent.sendNotification(subTitle, user, notificationContent)
                }
                notificationQueue.pushTask(task)
            })
        }
    }
    return notifications
}