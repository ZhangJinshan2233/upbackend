const createNotifiedUsersFactory = require('./createNotifiedUsers');
const notificationsFactory = require('./sendNotifications')
const scheduleTasksFactory = require('./scheduleTasks')
module.exports = () => {
    let notifiedUsersService = createNotifiedUsersFactory()
    let notificationServices = notificationsFactory(notifiedUsersService);
    let scheduleTasks = scheduleTasksFactory(notificationServices);

    scheduleTasks.nutritionNotifications();
    scheduleTasks.expiredUsersNotifications();
}