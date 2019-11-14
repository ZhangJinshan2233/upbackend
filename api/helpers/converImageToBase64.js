module.exports = {
    converPostImageToBase64: (postObj) => {
        let {
            _id,
            description,
            _coachee,
            rating,
            comments,
            createdDate
        } = postObj;

        let postImage = {}
        postImage.imgType = postObj.postImage.imgType;
        postImage.data = "data:image/jpeg;base64," + Buffer.from(postObj.postImage.data).toString('base64');

        let base64ImagePost = {
            _id,
            description,
            _coachee,
            rating,
            comments,
            createdDate,
            postImage
        };

        return base64ImagePost

    },

    converPrifleImageOfCommentsToBase64: (comment) => {
        let {
            content,
            createdDate,
            isCoach
        } = comment;
        let fullName = "";
        let profileImage = {}
        if (!isCoach) {
            if (!comment._coachee) return
            fullName = comment._coachee.firstName + " " + comment._coachee.lastName
            profileImage.imgType = comment._coachee.profileImage.imgType;

            if (comment._coachee.profileImage.data.length != 0) {
                profileImage.data = "data:image/jpeg;base64," + Buffer.from(comment._coachee.profileImage.data).toString('base64');
            } else {
                profileImage.data = Buffer.from(comment._coachee.profileImage.data).toString('base64');
            }

        } else {
            if (!comment._coach) return
            fullName = comment._coach.firstName + " " + comment._coach.lastName
            profileImage.imgType = comment._coach.profileImage.imgType;
            if (!comment._coach.profileImage.data.length != 0) {
                profileImage.data = "data:image/jpeg;base64," + Buffer.from(comment._coach.profileImage.data).toString('base64');
            } else {
                profileImage.data = Buffer.from(comment._coach.profileImage.data).toString('base64');
            }
        }
        let convertedComment = {
            content,
            createdDate,
            isCoach,
            fullName,
            profileImage
        }

        return convertedComment
    }
}