const Model = require('../models')
const {UserFacingError} = require('../middlewares').errorHandler
/**
 * create new  category('challenge category','habit category',
 * 'membership category',and 'app vrsion category')
 * @param{};
 */
let create_category = async (req, res) => {
    let {
        name
    } = req.body
    let category = await Model.Category.findOne({
        name: name
    });
    if (category) throw new UserFacingError('name has existed already')
    let newCategory = {};
    let {
        imgData,
        kind,
        ...otherProperties
    } = req.body

    if (!kind) throw UserFacingError('please selected kind of categories')
    let bufferImgData = null

    if (imgData) {
        bufferImgData = Buffer.from(imgData, 'base64')
    }

    newCategory = await Model[kind].create({
        imgData: bufferImgData,
        ...otherProperties
    })


    if (!newCategory) throw new UserFacingError('unsuccessfully');
    res.status(200).json({
        message: 'create successfully'
    })
};

/**
 * get all categories
 */

let get_categories = async (req, res) => {
    let queryParams = req.query
    let {
        filter,
        pageNumber,
        pageSize,
        sortOrder
    } = queryParams
    let categories = []
    numSort = sortOrder == 'asc' ? 1 : -1
    pageSize = parseInt(queryParams.pageSize)
    pageNumber = parseInt(queryParams.pageNumber) || 0
    try {
        categories = await Model.Category
            .find({
                $and: [{
                        kind: {
                            $regex: filter
                        }
                    }
                ]
            })
            .sort({
                'kind': numSort
            })
            .skip(pageSize * pageNumber)
            .limit(pageSize)
            .select('name isObsolete kind')
        res.status(200).json({
            categories
        })
    } catch (error) {
        throw new Error('get categories error')
    }
}
/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
let get_category_by_id = async (req, res) => {
    let {
        categoryId: _id
    } = req.params;
    let category = {}
    let currentCategory = await Model.Category.findById(_id)
    let jsonCategory = JSON.parse(JSON.stringify(currentCategory))
    if (Object.keys(jsonCategory).includes('imgData')) {
        let {
            imgData,
            imgType,
            ...otherProperties
        } = jsonCategory
        let image = null
        if (jsonCategory.imgData) {
            image = `data:${imgType};base64,` + Buffer.from(imgData).toString('base64');
        }
        category = {
            image,
            ...otherProperties
        }
    } else {
        category = jsonCategory
    }
    res.status(200).json({
        category
    })
}
/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
let update_category = async (req, res) => {
    let {
        categoryId: _id
    } = req.params
    let {
        imgData,
        kind,
        ...otherProperties
    } = req.body
    let bufferImgData = null
    if (imgData) {
        bufferImgData = Buffer.from(imgData, 'base64')
    }
    await Model[kind].findByIdAndUpdate(
        _id, {
            $set: {
                imgData: bufferImgData,
                ...otherProperties
            }
        });

    res.status(200).json({
        message: "updated successfully"
    })

}

/**
 * get total categories numbers
 */

let get_categories_total_numbers = async (req, res) => {
    let numCategories = 0;
    numCategories = await Model.Category.estimatedDocumentCount()
    res.status(200).json({
        numCategories
    })
}

/**
 * get total kinds
 */

let get_kinds = async (req, res) => {
    let kinds = []
    kinds = await Model.Category.distinct('kind')
    res.status(200).json({
        kinds
    })
}
/**
 * get Category by kind
 */

let get_categories_by_kind = async (req, res) => {
    let {
        kind
    } = req.query;
    let currentCategories = await Model.Category.find({
       $and:[{kind:kind},{isObsolete:false}]
    })
    let categories = []
    if (kind === "ChallengeCategory") {
        if (currentCategories.length > 0) {
            categories = currentCategories.reduce((acc, current) => {
                let jsonCategory = JSON.parse(JSON.stringify(current))
                let {
                    imgType,
                    imgData,
                    ...otherProperties
                } = jsonCategory
                let image = `data:${imgType};base64,` + Buffer.from(imgData).toString('base64');
                return [{
                    image,
                    ...otherProperties
                }, ...acc]
            }, [])
        }
    } else {
        categories = currentCategories
    }

    res.status(200).json({
        categories
    })
}
module.exports = {
    create_category,
    get_categories,
    get_category_by_id,
    update_category,
    get_categories_total_numbers,
    get_categories_by_kind,
    get_kinds
}