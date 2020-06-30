module.exports = () => {
    const ratingDescription = {};
    /**
     * get rating description for slumber journal challenge
     * @param {*} rating 
     */
    ratingDescription.slumbertime = (rating) => {
        let description = ''
        switch (true) {
            case (rating >= 5):
                description = "You did a fantastic job clocking in at least 7 hours of sleep. " +
                    " Your mood has been very positive and sleeping habits have been great as well, " +
                    " keep it  up!";
                break;
            case (rating >= 4.0):
                description = "You did a good job clocking in at least 7 hours of sleep." +
                    " Your mood hasbeen rather positive but your sleeping habits can be improved." +
                    " Ensure your nap takes less than 30 minutes and you drink no more than 2 cups of coffee a day."
                break;
            case (rating >= 3.0):
                description = "There can be room for improvement when it comes to clocking in at least 7 hours of  sleep." +
                    " You will find that your mood will improve accordingly as well." +
                    " Good job in ensuring that you nap takes less than 30 minutes and you drink no more than 2 cups of coffee a day."
                break;
            case (rating > 0.1):
                description = "There can be room for improvement when it comes to clocking in at least 7 hours of  sleep." +
                    " You will find that your mood will improve accordingly as well." +
                    " Ensure your nap takes less than 30 minutes and you drink no more than 2 cups of coffee a day."
                break;
            default:
                description = ""
                break;
        }
        return description
    };

    /**
     * get rating description for food journal challenge
     * @param {*} rating 
     */
    ratingDescription.fooddetective= (rating) => {
        let description = ''
        switch (true) {
            case (rating > 5):
                description = "Full of great nutrition. This is an everyday food choice";
                break;
            case (rating >= 4.0):
                description = "Full of great nutrition. This is an everyday food choice"
                break;
            case (rating >= 3.0):
                description = 'Mostly full of good nutrition, but lacking some key nutrients. This is an everyday food choice.'
                break;
            case (rating >= 2.0):
                description = 'Some good nutrition, but could be better. Choose no more than 2-3 times a week.'
                break;
            case (rating >= 1.1):
                description = 'Not the worst choice, but highly processed Choose less than once a week.'
                break;
            case (rating = 1):
                description = 'High in fat, sugar or salt Choose less than once a week.'
                break;
            default:
                description = ""
                break;
        }
        return description
    }

    return ratingDescription
}