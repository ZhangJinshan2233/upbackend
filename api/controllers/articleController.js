const {
    articleService
} = require('../service')
const Controller = require('./Controller');
const safeAwait = require('safe-await')
const {
    sampleSize
} = require('lodash');
class ArticleController extends Controller {
    constructor(service) {
        super(service)
        this.service = service
    }
    /**
     * user get articles by conditions
     * @param {*} queryParams 
     */

    userGetArticles = async (req, res) => {
        let [err, articles] = await safeAwait(
            this.service
            .userGetArticles(req.query)
        )
        if (err) throw err
        if (req.query.hasOwnProperty('goal')) {
            articles = sampleSize(articles, 1)
            res.status(200).json({
                article: articles[0]
            })
        } else {
            res.status(200).json({
                articles
            })
        }


    }

    /**
     * get Latest Three Videos Of All Categories
     */
    getLatestArticlesOfAllCategories = async (req, res) => {
        const [err, articles] = await safeAwait(
            this.service
            .getLatestArticlesOfAllCategories(req.params.kindName, 3)
        )
        if (err) throw err
        let  articlesOfMainCategory=[]
        if (articles.length > 0) {
            articlesOfMainCategory = articles.reduce((acc, current) => {
                return [...acc, {
                    articles: current.articles,
                    mainCategory: current.mainCategory
                }]
            }, [])
        } else {
            articlesOfMainCategory = []
        }
        res.status(200).json({
            articles: articlesOfMainCategory
        })
    }
}

const articleController = new ArticleController(articleService)
module.exports = articleController