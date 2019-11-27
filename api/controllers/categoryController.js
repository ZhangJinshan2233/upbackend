const Model=require('../models')
/**
 * @function create new version category;
 * @param{name, version};
 */
let create_category = async (req, res) => {

    let {
        name
    } = req.body
    let category = await Model.Category.findOne({
        name: name
    });
    if (category) throw new Error('name has existed already')
    let newCategory = {}
    if (Object.keys(req.body).includes('imgData')) {
        let bufferImgData = Object.create(null)
        let {
            imgData,
            ...otherProperties
        } = req.body
        if (imgData) {
            bufferImgData = Buffer.from(imgData, 'base64')
        }
        newCategory = await Model.Category.create({
            imgData: bufferImgData,
            ...otherProperties
        })
    } else {
        newCategory = await Model.Category.create(req.body)
    }

    if (!newCategory) throw new Error('unsuccessfully');
    res.status(200).json({
        message: 'create successfully'
    })
};

let get_categories = async (req, res) => {
    let {
        kind
    } = req.query;
    let currentCategories = await Model.Category.find({
        kind
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

let get_category_by_id = async (req, res) => {
    let {
        categoryId: _id
    } = req.params;
    let category = {}
    let currentCategory = await Model.Category.findById(_id)
    let jsonCategory = JSON.parse(JSON.stringify(currentCategory))
    if (Object.keys(jsonCategory).includes('imgData')) {
        if (jsonCategory.imgData) {
            let {
                imgData,
                imgType,
                ...otherProperties
            } = jsonCategory
            let image = `data:${imgType};base64,` + Buffer.from(imgData).toString('base64');
            category = {
                image,
                ...otherProperties
            }
        }
    } else {
        category = jsonCategory
    }

    res.status(200).json({
        category
    })
}

let update_category = async (req, res) => {
    let {
        categoryId: _id
    } = req.params
    let {kind}=req.query
   let changedProperties=req.body
    if (Object.keys(req.body).includes('imgData')) {
        let bufferImgData = Object.create(null)
        let {
            imgData,
            ...otherProperties
        } = req.body
        if (imgData) {
            bufferImgData = Buffer.from(imgData, 'base64')
            await Model[kind].findOneAndUpdate(
                _id, {
                    $set: {
                        imgData: bufferImgData,
                        ...otherProperties
                    }
                }).exec();
        }
    } else {
        await  Model[kind].findByIdAndUpdate(
            _id, {
                $set: changedProperties
            }).exec();
    }
    res.status(200).json({
        message: "updated successfully"
    })

}
module.exports = {
    create_category,
    get_categories,
    get_category_by_id,
    update_category
}