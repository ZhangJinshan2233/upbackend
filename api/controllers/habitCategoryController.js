const {
    HabitCategory
} = require('../models');
/**
 * @function create new habit category;
 * @param{name, groupName,description};
 */
let create_habit_category = async (req, res) => {
    let {
        name
    } = req.body

    let habit = await HabitCategory.findOne({
        name: name
    });

    if (habit) throw new Error('habit has existed already')

    let newHabit = await HabitCategory.create(req.body)
    if (!newHabit) throw new Error('unsuccessfully');
    res.status(200).json({
        message: 'create successfully'
    })
};
/**
 * @function update habit
 * @param {category property}
 */
let update_habit_category = async (req, res) => {
    let {
        _id,
        ...updateObject
    } = req.body

    let updatedHabitCategory = await HabitCategory.findByIdAndUpdate(
        _id, {
            $set: updateObject
        }).exec();

    res.status(200).json({
        message: "updated successfully"
    })

};

/**
 * get all the habit categories
 */
let get_habit_categories = async (req, res) => {

    let habitCategories = await HabitCategory.find()

    res.status(200).json({
        habitCategories
    })

}
module.exports = {
    create_habit_category,
    update_habit_category,
    get_habit_categories,
}