const Service = require('../Service');
const Models = require('../../models');
const {
    GCP
} = require('../../config/index')
const {
    Types
} = require('mongoose')
class ArticleService extends Service {
    constructor(modelName, uploadOptions) {
        super(modelName, uploadOptions)
        this.modelName = modelName;
    }

    /**
     * user get articles by conditions
     * @param {*} queryParams 
     */
    userGetArticles = (queryParams) => {
        let recordSize = 4;
        if (queryParams.hasOwnProperty('goal')) { //check goal condition
           let goalQuery = {};
            if (queryParams.goal=='undefined') {
                goalQuery = {};
            } else {
                goalQuery = {
                    goal: Types.ObjectId(queryParams.goal)
                }
            }
            return Models['LearnArticle']
                .find(goalQuery)
                .sort({
                    createdAt: -1
                })
                .limit(1)
                .populate({
                    path: 'mainCategory',
                    select: 'name'
                })
                .populate({
                    path: 'subCategory',
                    select: 'name'
                })
        } else {
            let skipNum = parseInt(queryParams.skipNum) || 0;
            return Models[this.modelName]
                .find({
                    mainCategory: Types.ObjectId(queryParams.mainCategory)
                })
                .sort({
                    createdAt: -1
                })
                .skip(skipNum)
                .limit(recordSize)
                .populate({
                    path: 'mainCategory',
                    select: 'name'
                })
                .populate({
                    path: 'subCategory',
                    select: 'name'
                })

        }
    }

    /**
     * get Latest Three articles Of All Categories
     */
    getLatestArticlesOfAllCategories = (kindName, num) => {
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
                    'articles': {
                        $slice: ['$docs', num]
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
const articleService = new ArticleService("Article",{
    bucketName: GCP.mediaBucket,
    imageDestination:'images'
});
module.exports = articleService