const {ChallengeCategory} = require('../models');
/**
 * @function create new challenge category;
 * @param{name,description,duration,image};
 */
let create_challenge_category = async (req, res) => {
    let {
        name,
        imgData,
        ...otherProperties
    } = req.body
    let challenge = await ChallengeCategory.findOne({
        name: name
    });
    if (challenge) throw new Error('challenge has existed already')

    let convertedImgData = Buffer.from(imgData, 'base64')
    let newChallenge = await ChallengeCategory.create({
        name,
        imgData: convertedImgData,
        ...otherProperties
    })
    if (!newChallenge) throw new Error('unsuccessfully');
    res.status(200).json({
        message: 'create successfully'
    })

};
/**
 * @function update challenge
 * @param {category property}
 */
let update_challenge_category = async (req, res) => {
    let {
        _id,
        ...updateObject
    } = req.body

    let updatedChallengeCategory = await ChallengeCategory.findByIdAndUpdate(
        _id, {
            $set: updateObject
        }).exec();

    res.status(200).json({
        message: "updated successfully"
    })

};

/**
 * get all the challenge categories
 */
let get_challenge_categories = async (req, res) => {
    let categories = await ChallengeCategory.find()
    let challengeCategories = []
    if (categories.length > 0) {
        challengeCategories = categories.reduce((acc, current) => {
            let {
                _id,
                imgType,
                imgData,
                name,
                description,
                duration,
                isObsolete,
                isFree
            } = current
            let image = `data:${imgType};base64,` + Buffer.from(imgData).toString('base64');
            return [{
                _id,
                image,
                name,
                description,
                duration,
                isObsolete,
                isFree
            }, ...acc]
        }, [])
    }

    res.status(200).json({
        challengeCategories
    })
}

let get_challengeCategory_by_id = async (req, res) => {

    let {
        challengeCategoryId: _id
    } = req.params;
    console.log(_id)
    let challengeCategory = {}
    let category = await ChallengeCategory.findById(_id)
    if (category.imgData) {
        let {
            _id,
            imgData,
            imgType,
            name,
            description,
            isObsolete,
            isFree,
            duration
        } = category
        let image = `data:${imgType};base64,` + Buffer.from(imgData).toString('base64');
        challengeCategory = {
            _id,
            name,
            description,
            isObsolete,
            isFree,
            duration,
            image
        }
    }
    res.status(200).json({
        challengeCategory
    })
}

module.exports = {
    create_challenge_category,
    update_challenge_category,
    get_challenge_categories,
    get_challengeCategory_by_id
}