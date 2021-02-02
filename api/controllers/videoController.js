const {
    videoService
} = require('../service');
const safeAwait = require('safe-await')
const Controller = require('./Controller');
const {
    sampleSize
} = require('lodash');
class VideoController extends Controller {
    constructor(service) {
        super(service)
        this.service = service
    }

    /**
     * user get videos by conditions
     * @param {*} queryParams 
     */

    userGetVideos = async (req, res) => {
        let [err, videos] = await safeAwait(
            this.service
            .userGetVideos(req.query)
        )
        if (req.query.hasOwnProperty('isFeatured')) {
            videos = sampleSize(videos, 2)
        }

        if (err) throw err
        res.status(200).json({
            videos
        })
    }

    /**
     * get Latest Three Videos Of All Categories
     */
    getLatestVideosOfAllCategories = async (req, res) => {
        const [err, videos] = await safeAwait(
            this.service
            .getLatestVideosOfAllCategories(req.params.kindName, 2)
        )

        if (err) throw err
        let videosOfMainCategory = []
        if (videos.length > 0) {
            if (req.params.kindName === 'TipVideo') {
                videosOfMainCategory = videos.reduce((acc, current) => {
                    return [...acc, {
                        video: current.videos[0],
                        mainCategory: current.mainCategory
                    }]
                }, [])
            } else {
                videosOfMainCategory = videos.reduce((acc, current) => {
                    return [ {
                        videos: current.videos,
                        mainCategory: current.mainCategory
                    },...acc]
                }, [])
                videosOfMainCategory.sort(function(a, b) {
                    let nameA = a.mainCategory.name.toUpperCase(); // ignore upper and lowercase
                    let nameB = b.mainCategory.name.toUpperCase(); // ignore upper and lowercase
                    if (nameA < nameB) {
                      return 1;
                    }
                    if (nameA > nameB) {
                      return -1;
                    }
                  
                    // names must be equal
                    return 0;
                  })
            }
        } else {
            videosOfMainCategory = []
        }
        res.status(200).json({
            videos: videosOfMainCategory
        })
    }
}

const videoController = new VideoController(videoService)
module.exports = videoController