import Blog from "../models/Blog.js";
import Comment from "../models/Comment.js";
import Notification from "../models/Notification.js";


export const addComment = async (req, res) => {

    let user_id = req.user;

    let { _id, comment, blog_author, replying_to, notification_id } = req.body;

    if (!comment.length) {
        return res.status(403).json({ error: "write something to leave a comment" })
    }

    // creating a comment doc
    let commentObj = {
        blog_id: _id, blog_author, comment, commented_by: user_id
    }

    if (replying_to) { // if it's a replying comment then add a parent value
        commentObj.parent = replying_to;
        commentObj.isReply = true;
    }

    new Comment(commentObj).save().then(async commentFile => {
        
        let { comment, commentedAt, children } = commentFile;
        
        Blog.findOneAndUpdate({ _id }, { $push: { "comments": commentFile._id }, $inc: { "activity.total_comments": 1, "activity.total_parent_comments": replying_to ? 0 : 1 } })
        .then(blog => {
            console.log("New Comment created")
        });

        let notificationObj = {
            type: replying_to ? "reply" : "comment",
            blog: _id,
            notification_for: blog_author,
            user: user_id,
            comment: commentFile._id
        }

        if (replying_to) { // if it's a replying comment

            notificationObj.replied_on_comment = replying_to;

            await Comment.findOneAndUpdate({ _id: replying_to }, { $push: { children: commentFile._id } })
            .then(replyingToCommentDoc => {
                notificationObj.notification_for = replyingToCommentDoc.commented_by
            })

            if (notification_id) {
                Notification.findOneAndUpdate({ _id: notification_id }, { reply: commentFile._id })
                .then(notification => console.log("notification updated"))
            }

        }

        new Notification(notificationObj).save().then(notification => {
            console.log("new notification created");
        })

        return res.status(200).json({
            comment, commentedAt, _id: commentFile._id, user_id, children
        })

    })

}

export const getBlogComments = async (req, res) => {

    let { blog_id, skip } = req.body;
    
    let maxLimit = 5;
    
    Comment.find({ blog_id, isReply: false })
    .populate("commented_by", "personal_info.username personal_info.fullname personal_info.profile_img")
    .skip(skip)
    .limit(maxLimit)
    .sort({
        "commentedAt": -1 // to get latest comment first
    })
    .then(comment => {
        return res.status(200).json(comment);
    })
    .catch(err => {
        console.log(err.message);
        return res.status(500).json({ error: err.message })
    })

}

export const getReplies = async (req, res) => {

    let { _id, skip } = req.body;

    let maxLimit = 5;

    Comment.findOne({ _id })
    .populate({
        path: "children",
        options: {
            limit: maxLimit,
            skip: skip,
            sort: { "commentedAt": -1 } // latest comment first
        },
        populate: {
            path: "commented_by",
            select: "personal_info.profile_img personal_info.fullname personal_info.username"
        },
        select: "-blog_id -updatedAt"
    })
    .select("children")
    .then(doc => {
        // console.log(doc);
        // console.log(doc.children);
        return res.status(200).json({ replies: doc.children })
    })
    .catch(err => {
        return res.status(500).json({ error: err.message })
    })

}

// recursive utility function to delete comments
const deleteComments = ( _id ) => {
    Comment.findOne({ _id })
    .then(comment => {
        if (comment.parent) {
            Comment.findOneAndUpdate({ _id: comment.parent }, { $pull: { children: _id } })
            .then(data => console.log("comment delete from parent"))
            .catch(err => console.log(err));
        }

        Notification.findOneAndDelete({ comment: _id }).then(notification => console.log("comment notification deleted"))

        Notification.findOneAndUpdate({ reply: _id }, { $unset: { reply: 1 } }).then(notification => console.log("reply notification deleted"))

        Blog.findOneAndUpdate({ _id: comment.blog_id }, { $pull: { comments: _id }, $inc: { "activity.total_comments": -1 }, "activity.total_parent_comments": comment.parent ? 0 : -1 })
        .then(blog => {
            if (comment.children.length) {
                comment.children.map(replies => {
                    deleteComments(replies) // recursively delete the comments
                })
            }
        })
    })
    .catch(err => {
        console.log(err.message);
    })

}

export const deleteComment = async (req, res) => {

    let user_id = req.user;

    let { _id } = req.body;

    Comment.findOne({ _id })
    .then(comment => {

        if (user_id == comment.commented_by || user_id == comment.blog_author) {

            deleteComments(_id);

            return res.status(200).json({ status: "done" });

        } else {
            return res.status(403).json({ error: "you cannot delete this comment" });
        }

    })

}