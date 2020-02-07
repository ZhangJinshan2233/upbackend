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
        healthyTipId: _id
    } = req.params
    let healthyTip = {}
    let {
        imgData,
        ...otherProperties
    } = req.body
    let bufferImgData = null
    if (imgData) {
        bufferImgData = Buffer.from(imgData, 'base64')
    }
    healthyTip = await HealthyTip.findByIdAndUpdate(_id, {
        $set: {
            imgData: bufferImgData,
            ...otherProperties
        }
    })
    res.status(200).json({
        message: "updated successfully"
    })

};
/**
 * coachee get healthyTips
 */
let get_healthyTips_pagination = async (req, res) => {
    let healthyTips = []
    let convertedHealthyTips = []
    let skipNum = parseInt(req.query.skipNum) || 0;
    let recordSize = 2;
    healthyTips = await HealthyTip.find({
            isObsolete: false
        })
        .sort({grade:-1,
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
/**
 * admin get healthyTips
 */
let admin_get_healthyTips_pagination = async (req, res) => {
    let queryParams = req.query
    let {
        filter,
        pageNumber,
        pageSize,
        sortOrder
    } = queryParams
    numSort = sortOrder == 'asc' ? 1 : -1
    pageSize = parseInt(queryParams.pageSize)
    pageNumber = parseInt(queryParams.pageNumber) || 0
    try {
        healthyTips = await HealthyTip
            .find({
                $and: [{
                        title: {
                            $regex: filter
                        }
                    },
                    {
                        isObsolete: false
                    }
                ]
            })
            .sort({grade:-1,
                'createdAt': numSort
            })
            .skip(pageSize * pageNumber)
            .limit(pageSize)
            .select('title isObsolete createdAt grade')
        res.status(200).json({
            healthyTips
        })
    } catch (error) {
        throw new Error('get healthytips error')
    }
}

let get_healthytips_total_numbers = async (req, res) => {
    let numHealthyTips = 0
    try {
        numHealthyTips = await HealthyTip.estimatedDocumentCount()
    } catch (error) {
        throw new Error('internal error')
    }

    res.status(200).json({
        numHealthyTips
    })

}

let get_healthyTip_by_id = async (req, res) => {
    let healthyTip = {}
    let {
        healthyTipId: _id
    } = req.params
    healthyTip = await HealthyTip.findById(_id)
    if (!healthyTip) throw Error('can not find')
    //prevent theRestOfPropertiesCoach passing parent class of coach object
    let deserializationHealthyTip = JSON.parse(JSON.stringify(healthyTip))
    let {
        imgData,
        ...theRestOfPropertiesHealthyTip
    } = deserializationHealthyTip
    let healthyTipImgData = ""
    if (imgData) {
        healthyTipImgData = Buffer.from(imgData).toString('base64')
    }
    currentHealthyTip = {
        imgData: healthyTipImgData,
        ...theRestOfPropertiesHealthyTip
    }
    res.status(200).json({
        healthyTip: currentHealthyTip
    })
}
module.exports = {
    create_healthy_tip,
    update_healthy_tip,
    get_healthyTips_pagination,
    admin_get_healthyTips_pagination,
    get_healthytips_total_numbers,
    get_healthyTip_by_id
}