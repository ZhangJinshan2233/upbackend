const Models = require('../models');
const {
    deleteFile,
    uploadPhoto,
    getGCPName,
    uploadVideo
} = require('./mediaHelper');

/**
 * update document processor
 */
const updateProcessor = {
    update(_id, kind, properties) {
        if (Object.keys(properties).length == 1 && properties.hasOwnProperty('viewership')) {
            return Models[kind].findByIdAndUpdate(
                _id, {
                    $inc: {
                       viewership:1
                    }
                }
            )
        } else {
            console.log('_id',_id)
            return Models[kind].findByIdAndUpdate(
                _id, {
                    $set: {
                        ...properties
                    }
                }
            )
        }

    },
    async updatePoster(_id, kind, properties, uploadOptions) {
        let {
            posterFile,
            ...otherProperties
        } = properties
        try {
            const document = await Models[kind].findById(_id);
            const newPoster = await uploadPhoto(uploadOptions, posterFile);
            await deleteFile(uploadOptions.bucketName, getGCPName(document.posterUrl));
            const changedProperties = {
                ...newPoster,
                ...otherProperties
            }
            return this.update(_id, kind, changedProperties);
        } catch (err) {
            return err
        }
    },

    async updateVideo(_id, kind, properties, uploadOptions) {
        let {
            videoFile,
            ...otherProperties
        } = properties
        try {
            let document = await Models[kind].findById(_id);
            const newVideo = await uploadVideo(uploadOptions, videoFile);
            await deleteFile(uploadOptions.bucketName, getGCPName(document.videoUrl));
            const changedProperties = {
                ...newVideo,
                ...otherProperties
            }
            return this.update(_id, kind, changedProperties);
        } catch (err) {
            return err
        }
    },

    async updateVideoAndPoster(_id, kind, properties, uploadOptions) {
        const {
            posterFile,
            videoFile,
            ...otherProperties
        } = properties
        try {
            let document = await Models[kind].findById(_id);
            const newPoster = await uploadPhoto(uploadOptions, posterFile);
            await deleteFile(uploadOptions.bucketName, getGCPName(document.posterUrl));
            const newVideo = await uploadVideo(uploadOptions, videoFile);
            await deleteFile(uploadOptions.bucketName, getGCPName(document.videoUrl));
            const changedProperties = {
                ...newVideo,
                ...newPoster,
                ...otherProperties
            }
            return this.update(_id, kind, changedProperties);
        } catch (err) {
            return err
        }
    },
}

/**
 * document creator
 */
const documentCreator = {
    createDocument(model, document) {
        return Models[model].create({
            ...document
        })
    },
    async createDocumentWithPoster(model, document, uploadOptions) {
        const properties = {};
        let {
            posterFile,
            ...otherProperties
        } = document
        if(posterFile==='undefined'||!posterFile){
            return this.createDocument(model, document)
        }
        const poster = await uploadPhoto(uploadOptions, posterFile);
        Object.assign(properties, poster, otherProperties);
        return this.createDocument(model, properties)
    },
    async createDocumentWithPosterAndVideo(model, document, uploadOptions) {
        const properties = {};
        let {
            posterFile,
            videoFile,
            ...otherProperties
        } = document
        let promises = [];
        const videoPromise = uploadVideo(uploadOptions, videoFile);
        promises.push(videoPromise);
        const posterPromise = uploadPhoto(uploadOptions, posterFile);
        promises.push(posterPromise);
        const videoAndPosterFiles = await Promise.all(promises);
        videoAndPosterFiles.forEach(media => {
            Object.assign(properties, media)
        })
        Object.assign(properties, otherProperties)
        return this.createDocument(model, properties)
    }
}

/**
 * service class
 * provide basic funs
 */
class Service {
    constructor(modelName, uploadOptions) {
        this.modelName = modelName;
        this.uploadOptions = uploadOptions||{}
    }
    /**
     * get all documents based on different conditions
     * @param {*} queryParams 
     */
    getAllDocuments = (queryParams) => {
        let {
            filter,
            pageNumber,
            pageSize,
            sortOrder
        } = queryParams
        let numSort = sortOrder == 'asc' ? 1 : -1
        pageSize = parseInt(pageSize) ? parseInt(pageSize) : 20

        if (filter) {
            filter = filter.charAt(0).toUpperCase() + filter.slice(1)
        } else {
            filter = ''
        }
        pageNumber = parseInt(pageNumber) || 0;
        return Models[this.modelName]
            .find({
                kind: {
                    $regex: filter
                }
            })
            .sort({
                'kind': numSort
            })
            .skip(pageSize * pageNumber)
            .limit(pageSize)
    };

    /**
     * create new document
     * @param {*} properties 
     */
    createDocument = (document) => {
        try {
            const hasPoster = Models[this.modelName].schema.tree.hasOwnProperty('posterUrl');
            const hasVideo = Models[this.modelName].schema.tree.hasOwnProperty('videoUrl');
            if (hasPoster && !hasVideo) {
                if (Models[this.modelName].schema.tree['posterUrl'].required) {
                    if (!document.hasOwnProperty('posterFile')) {
                        throw new Error('please select image')
                    }
                }
                return documentCreator.createDocumentWithPoster(this.modelName, document, this.uploadOptions)
            } else if (hasVideo) {
                if (Models[this.modelName].schema.tree['posterUrl'].required || Models[this.modelName].schema.tree['videoUrl'].required) {
                    if (!document.hasOwnProperty('posterFile') || !document.hasOwnProperty('videoFile')) {
                        throw new Error('please select correctly')
                    }
                }
                return documentCreator.createDocumentWithPosterAndVideo(this.modelName, document, this.uploadOptions)
            } else {
                return documentCreator.createDocument(this.modelName, document)
            }
        } catch (err) {
            throw err
        }
    }

    /**
     * get document by id 
     * @param {*} _id 
     */
    getDocumentById = (_id) => {
        return Models[this.modelName]
            .findById(_id)
    };

    /**
     * delte document by id 
     * @param {*} _id 
     */
    deleteDocumentById = async (_id) => {
        try {
            const document = await Models[this.modelName].findById(_id);
            if (document.hasOwnProperty('posterUrl')) {
                await deleteFile(this.uploadOptions.bucketName, getGCPName(document.posterUrl));
            }
            if (document.hasOwnProperty('videoUrl')) {
                await deleteFile(this.uploadOptions.bucketName, getGCPName(document.videoUrl));
            }
            return Models[this.modelName].findByIdAndDelete(_id)
        } catch (err) {
            return new Error('deleted wrongly')
        }
    };

    /**
     * update document by id 
     * @param {*} _id 
     * @param {*} model 
     */
    updateDocumentById = (_id, kind, properties) => {
        let modelName = kind;
        let changedProperties = properties
        if (typeof (kind) === 'object') {
            changedProperties = kind;
            modelName = this.modelName;
        }
        let hasPosterFile = changedProperties.hasOwnProperty('posterFile')
        let hasVideoFile = changedProperties.hasOwnProperty('videoFile')
        try {
            switch (true) {
                case (!hasVideoFile && hasPosterFile):
                    console.log('update poster')
                    return updateProcessor.updatePoster(_id, modelName, changedProperties, this.uploadOptions);
                case (hasVideoFile && !hasPosterFile):
                    console.log('update video')
                    return updateProcessor.updateVideo(_id, modelName, changedProperties, this.uploadOptions);
                case (hasVideoFile && hasPosterFile):
                    console.log('update video and poster')
                    return updateProcessor.updateVideoAndPoster(_id, modelName, changedProperties,this.uploadOptions);
                default:
                    console.log('update common fields')
                    return updateProcessor.update(_id, modelName, changedProperties)
            }
        } catch (err) {
            return err
        }

    }

    /**
     * get total number of documents
     */
    getTotalNumbersOfDocuments = () => {
        return Models[this.modelName].countDocuments()
    }
    /**
     * get kinds of videos
     */
    getKinds = () => {
        return Object.keys(Models[this.modelName].discriminators)
    }
}

module.exports = Service