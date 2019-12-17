const {
    HealthyTip
} = require('../models');
/**
 * @function create new healthy tip;
 * @param{};
 */
let create_healthy_tip = async (req, res) => {
    let {
        imgData,
        ...otherProperties
    } = req.body
    let convertedImgData = Buffer.from(imgData, 'base64')
    let newHealthyTip = await HealthyTip.create({
        imgData: convertedImgData,
        ...otherProperties
    })
    if (!newHealthyTip) throw new Error('unsuccessfully');
    res.status(200).json({
        message: 'create successfully'
    })
};
/**
 * @function update healthy tip
 * @param {}
 */
let update_healthy_tip = async (req, res) => {
    let {
        ...updateObject
    } = req.body

    let {
        healthTipId: _id
    } = req.params
    await HealthyTip.findByIdAndUpdate(
        _id, {
            $set: updateObject
        }).exec();

    res.status(200).json({
        message: "updated successfully"
    })

};

/**
 * get healthyTips
 */
let get_healthyTips_pagination = async (req, res) => {
    let healthyTips = []
    let convertedHealthyTips = []
    let skipNum = parseInt(req.query.skipNum) || 0;
    let recordSize = 2;
    healthyTips = await HealthyTip.find({
            isObsolete: false
        })
        .sort({
            createdAt: -1
        })
        .skip(skipNum)
        .limit(recordSize)
    if (healthyTips.length > 0) {
        convertedHealthyTips = healthyTips.reduce((acc, current) => {
            let {
                _id,
                imgType,
                imgData,
                title,
                url,
                description,
                isObsolete,
                createdAt
            } = current
            let image = ''
            if (imgData) {
                image = `data:${imgType};base64,` + Buffer.from(imgData).toString('base64');
            }
            return [...acc, {
                _id,
                image,
                title,
                url,
                description,
                isObsolete,
                createdAt
            }]
        }, [])
    }
    res.status(200).json({
        healthyTips: convertedHealthyTips
    })
}
module.exports = {
    create_healthy_tip,
    update_healthy_tip,
    get_healthyTips_pagination,
}