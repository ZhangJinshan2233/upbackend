const Service = require('../Service');
const Models = require('../../models');
const {GCP}=require('../../config')
//get different query object of mongoose library base on query duration
const durationProcessor = {
    short() {
        return {
            duration: {
                $lte: 10
            }
        }
    },
    shortAndIntermediate() {
        return {
            duration: {
                $lte: 30
            }
        }
    },
    shortAndLong() {
        return durationQuery = {
            $or: [{
                duration: {
                    $lte: 10
                }
            }, {
                duration: {
                    $gt: 30
                }
            }]
        }
    },
    intermediate() {
        return {
            duration: {
                $gt: 10,
                $lte: 30
            }
        }
    },
    intermediateAndLong() {
        return {
            duration: {
                $gt: 10
            }
        }
    },
    long() {
        return {
            duration: {
                $gt: 30
            }
        }
    },
    others() {
        return {}
    }
}

//get different query object of mongoose library base on query conditions
const conditionsProcessor = {
    durationArray(durations) {
        let durationQuery = {}
        let hasShortDuration = false;
        let hasIntermediateDuration = false;
        let hasLongDuration = false;
        if (durations.includes('shortDuration')) {
            hasShortDuration = true;
        }
        if (durations.includes('intermediateDuration')) {
            hasIntermediateDuration = true
        }
        if (durations.includes('longDuration')) {
            hasLongDuration = true
        }
        if (hasShortDuration && !hasIntermediateDuration && !hasLongDuration) {
            durationQuery = durationProcessor.short();
        } else if (hasShortDuration && hasIntermediateDuration && !hasLongDuration) {
            durationQuery = durationProcessor.shortAndIntermediate()
        } else if (hasShortDuration && !hasIntermediateDuration && hasLongDuration) {
            durationQuery = durationProcessor.shortAndLong()
        } else if (!hasShortDuration && hasIntermediateDuration && !hasLongDuration) {
            durationQuery = durationProcessor.intermediate()
        } else if (!hasShortDuration && hasIntermediateDuration && hasLongDuration) {
            durationQuery = durationProcessor.intermediateAndLong()
        } else if (!hasShortDuration && !hasIntermediateDuration && hasLongDuration) {
            durationQuery = durationProcessor.long()
        } else {
            durationQuery = durationProcessor.others()
        }
        return durationQuery
    },
    categoryArray(categories) {
        return {
            mainCategory: {
                $in: categories
            }
        }
    },
    difficultyArray(difficulities) {
        return {
            difficulty: {
                $in: difficulities
            }
        }
    },
    isFeatured(isFeatured) {
        return {
            isFeatured: Boolean(isFeatured)
        }
    }
}

const queryProcessor = (queryParams, param) => {
    if (queryParams.hasOwnProperty(param)) {
        return conditionsProcessor[param](queryParams[param]);
    } else {
        return {}
    }
}

class VideoService extends Service {
    constructor(modelName,uploadOptions) {
        super(modelName,uploadOptions)
        this.modelName = modelName;
    }

    /**
     * user get videos by conditions
     * @param {*} queryParams 
     */
    userGetVideos = (queryParams) => {
        let durationQuery = {};
        let categoryQuery = {};
        let difficultyQuery = {};
        let isFeaturedQuery = {};
        let recordSize = 6;
        let kind = '';
        if (queryParams.hasOwnProperty('kind') && queryParams['kind']) {
            kind = queryParams['kind'];
        } else {
            throw new Error('please select video type')
        }
        durationQuery = queryProcessor(queryParams, 'durationArray'); //check duration condition
        categoryQuery = queryProcessor(queryParams, 'categoryArray'); //check category condition
        difficultyQuery = queryProcessor(queryParams, 'difficultyArray'); //check difficulty condition

        if (queryParams.hasOwnProperty('isFeatured') && kind === 'StudioVideo') { //check isFeatured condition
            isFeaturedQuery = queryProcessor(queryParams, 'isFeatured')
            return Models[kind]
                .find(isFeaturedQuery)
                .sort({
                    createdAt: -1
                })
                .limit(2)
        } else {
            let skipNum = parseInt(queryParams.skipNum) || 0;
            return Models[kind]
                .find({
                    $and: [
                        durationQuery,
                        difficultyQuery,
                        categoryQuery
                    ]
                })
                .sort({
                    createdAt: -1
                })
                .skip(skipNum)
                .limit(recordSize)

        }
    }

    /**
     * get Latest Three Videos Of All Categories
     */
    getLatestVideosOfAllCategories = (kindName, num) => {
        let selectedNum = num
        if (kindName == 'TipVideo') {
            selectedNum = 1
        }
        return Models[kindName].aggregate([{
                $sort: {
                    createdAt: -1
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'subCategory',
                    foreignField: '_id',
                    as: 'subCategory'
                }
            },
            // {
            //     $project: { //select fields
            //         posterUrl: 1,
            //         _id: 1,
            //         difficulty: 1,
            //         createdAt: 1,
            //         mainCategory: 1,
            //         title:1

            //     }
            // },
            {
                $group: { //group by mainCategory
                    "_id": "$mainCategory",
                    "docs": {
                        $push: '$$ROOT'
                    }
                }

            },
            {
                $project: { //select first three videos for each category
                    'videos': {
                        $slice: ['$docs', selectedNum]
                    }
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'mainCategory'
                }
            },
            {
                $unwind: {
                    path: "$mainCategory"
                }
            }
        ])
    }
}
const videoService = new VideoService("Video",{
    bucketName: GCP.mediaBucket,
    videoDestination:'videos',
    imageDestination:'images'
});
module.exports = videoService