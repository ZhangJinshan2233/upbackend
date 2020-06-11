const {
    scheduleJob,
    Range
} = require('node-schedule')
module.exports = (notificationService) => {
   const scheduleTasks = {};
    scheduleTasks.nutritionNotifications = () => {
        scheduleJob('5 15 9 * * *', notificationService.sendNoPostUsersForNutritionChallenge)
    }

    scheduleTasks.expiredUsersNotifications=()=>{
        scheduleJob('30 0 0 * * *',notificationService.sendExpiredUsersForNutritionChanllenge)
    }
    return scheduleTasks
}