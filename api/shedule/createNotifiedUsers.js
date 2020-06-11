const {
    Challenge
} = require('../models');
const {
    subHours,
    startOfToday,
    startOfYesterday
} = require('date-fns')
module.exports = () => {
    const notifiedUsers = {}
    notifiedUsers.findNoPostUsersForNutritionChallenge = async () => {
        const challengeName = 'Food Detective';
        let nutritionChallenges = []
        nutritionChallenges = await Challenge.find({
                $and: [{
                    endDate: {
                        $gte: new Date()
                    }
                }, {
                    isObsolete: false
                }]
            })
            .populate({
                path: '_challengeCategory',
                match: {
                    name: challengeName
                },
                select: 'name'
            })
            .populate({
                path: 'posts._post',
                model: 'FoodJournalPost',
                match: {
                    createDate: {
                        $gte: subHours(new Date(), 17)
                    }
                }
                .select('createDate')
            })
            .select('_coachee')
        let noPostUsers = []
        if (nutritionChallenges.length) {
            noPostUsers = nutritionChallenges
                .filter(nutritionChallenge => {
                    if (nutritionChallenge._challengeCategory != null) {
                        if (nutritionChallenge.posts.length === 0) {
                            return true
                        }
                        for (let i = 0; i < nutritionChallenge.posts.length; i++) {
                            if (nutritionChallenge.posts[i]._post) {
                                return false
                            }
                        }
                        return true
                    }
                    return false
                })
                .map((nutritionChallenge) => {
                    return nutritionChallenge._coachee
                })
        }
        console.log(noPostUsers)
        return noPostUsers
    }

    notifiedUsers.findExpiredUsersYesterday = async () => {
        const challengeName = 'Food Detective';
        let expiredChallenges = []
        expiredChallenges = await Challenge.find({
                $and: [{
                    isObsolete: false
                }, {
                    endDate: {
                        $gte: subHours(startOfYesterday(new Date()),8),
                        $lte:subHours( startOfToday(new Date()),8)
                    }
                }]
            }).populate({
                path: '_challengeCategory',
                match: {
                    name: challengeName
                },
                select: 'name'
            })
            .select('_coachee')
        let expiredUsers = []
        if (expiredChallenges.length) {
            expiredUsers = expiredChallenges.filter(expiredChallenge => {
                return expiredChallenge._challengeCategory != null
            }).map(expiredChallenge => {
                return expiredChallenge._coachee
            })
        }
        console.log(expiredUsers)
        return expiredUsers
    }
    return notifiedUsers
}