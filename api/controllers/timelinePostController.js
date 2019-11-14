const Model = require('../models')
const convertImage=require('../helpers/converImageToBase64')
module.exports = {
    /**
     * @function create_new_post.
     * @public
     * @param {req.user}
     *        {req.body} :imgData=>base64;description
     * @returns string
     */
    create_new_post: async (req, res) => {

        let {
            imgData,
            description
        } = req.body;

        let {
            _id
        } = req.user;

        let coachee = await Model.Coachee.findById(_id);

        if (!coachee) throw Error('you need register');

        if (!imgData && !description)

            throw Error('You need to input description or upload a piece of image');

        try {
            let newPost = new Model.TimelinePost({
                _coachee: _id,
                description: description,
                postImage: {
                    imgType: "image/jpeg",
                    data: Buffer.from(imgData, 'base64')
                }
            })
            let timelinePost = await newPost.save();

            let base64ImagePost = convertImage.converPostImageToBase64(timelinePost)

            return res.status(200).json({
                timelinePost: base64ImagePost
            })

        } catch (err) {
            throw err
        }
    },

    /**
     * get timeline posts
     * @function    get_timeline_post
     * @public
     * @param       {req.user}
     *              {req.query}:skipNum =>skip number
     * @returns     Array[post]
     */

    get_timeline_post: async (req, res) => {

        let {
            _id
        } = req.user

        let skipNum = parseInt(req.query.skipNum)

        let recordSize = 3;

        convert_buffer_to_base64 = (timelinePosts) => {

            let base64ImagePosts = [];

            base64ImagePosts = timelinePosts.map(timelinePost => {
              return convertImage.converPostImageToBase64(timelinePost)
            })

            return base64ImagePosts;

        };

        try {
            let base64Images = [];
            let timelinePosts = await Model.TimelinePost
                .find()
                .byCoacheeId(_id)
                .sort({
                    'createdDate': -1
                })
                .skip(skipNum)
                .limit(recordSize)
                .exec()

            if (timelinePosts.length >= 1) {
                base64Images = convert_buffer_to_base64(timelinePosts)
            }

            return res.status(200).json({
                timelinePosts: base64Images
            })
        } catch (err) {
            throw err
        }

    },

    /**
     * get all comments by timeline post id
     * @function get_commments
     * @params {req.params} :postId
     * @return Array
     */
    get_commments: async (req, res) => {
        let {
            postId
        } = req.params;
        try {
            let post = await Model.TimelinePost.findById(postId)
            console.log(post.comments)
            let convertedComments=post.comments.map(comment=>{
               return  convertImage.converPrifleImageOfCommentsToBase64(comment)
            })
            return res.status(200).json({
                comments: convertedComments
            })

        } catch (err) {
            throw err
        }
    },

    /**
     * create new comment 
     * @function create_new_comment
     * @params {req.params}
     *          {req.body}
     * @returns string
     */
    create_new_comment: async (req, res) => {

        let _coach = null;
        let _coachee = null;
        let isCoach = false;
        let {
            userType,
            _id
        } = req.user

        if (userType == "freeCoachee" || userType == "premiumCoachee") {
            isCoach = false;
            _coachee = _id;

        }

        if (userType == "coach" || userType == "adminCoach") {
            isCoach = true;
            _coach = _id

        }
        let {
            content
        } = req.body

        let {
            postId
        } = req.params

        let newComment = {
            isCoach: isCoach,
            _coach: _coach,
            _coachee: _coachee,
            content: content,
            createdDate: new Date()
        }

        try {
            let post = await Model.TimelinePost.findById(postId)
            post.comments.push(newComment)
            await post.save()
            let newPost = await Model.TimelinePost.findById(postId).select({
                comments: {
                    "$elemMatch": {
                        createdDate: newComment.createdDate
                    }
                }
            })
            
            let comment=convertImage.converPrifleImageOfCommentsToBase64(newPost.comments[0])
            return res.status(200).json({
                comment: comment
            })
        } catch (error) {
            throw error
        }

    }
}