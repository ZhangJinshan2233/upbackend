const {MembershipCategory} = require('../models');
/**
 * @function create new membership category;
 * @param{name,type,duration,cost};
 */
let create_membership_category = async (req, res) => {
    let {
        name,
        type,
        ...otherProperties
    } = req.body
    let category = await MembershipCategory.findOne({
        $and:[{ name},{type}]
       
    });
    if (category) throw new Error('challenge has existed already')

    let newCategory = await MembershipCategory.create({
        name,
        type,
        ...otherProperties
    })
    if (!newCategory) throw new Error('unsuccessfully');
    res.status(200).json({
        message: 'create successfully'
    })

};
/**
 * @function update challenge
 * @param {category property}
 */
let update_membership_category = async (req, res) => {
    let {
        _id,
        ...updateObject
    } = req.body

    let updatedMembershipCategory = await MembershipCategory.findByIdAndUpdate(
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
let get_membership_categories = async (req, res) => {
    let categories = await MembershipCategory.find()
    res.status(200).json({
        categories
    })
}

let get_MembershipCategory_by_id = async (req, res) => {

    let {
        membershipCategoryId: _id
    } = req.params;
    let category = await MembershipCategory.findById(_id)
   
    res.status(200).json({
        category
    })
}

module.exports = {
    create_membership_category,
    update_membership_category,
    get_membership_categories,
    get_MembershipCategory_by_id
}