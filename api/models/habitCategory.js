const {
    Schema,
    model
} = require('mongoose')
const habitCategorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    group: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    isObsolete: {
        type: Boolean,
        default: false
    }
})

module.exports = model("HabitCategory", habitCategorySchema);