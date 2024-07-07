import express from "express";
import mongoose from "mongoose";
import bodyParser from 'body-parser';
import 'dotenv/config'
import bcrypt from "bcrypt" // encryt password
import { nanoid } from "nanoid"; // generate random number for username
import jwt from "jsonwebtoken";
import cors from "cors";
import admin from "firebase-admin";
import serviceAccountKey from "./blogging-website-using-mern-firebase-adminsdk-ugmk0-8d6639e6be.json" assert { type: "json" };
import { getAuth } from "firebase-admin/auth";

import authRoutes from './routes/authRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
// import notificationRoutes from './routes/notificationRoutes.js';
import userRoutes from './routes/userRoutes.js';

// schema

import User from "./models/User.js"; // import User collections from mongodbaltas
import Blog from "./models/Blog.js"; // import Blog collections from mongodbaltas
import Notification from "./models/Notification.js";
import Comment from "./models/Comment.js";
import { verifyJWT } from "./middlewares/verifyJWT.js";

const server = express();
let PORT = 3000;

server.use(express.json());
server.use(cors());
server.use(bodyParser.json({ limit: '50mb' }));
server.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

admin.initializeApp({ // firstly generate new prviate key from firebase project settings and place the downloaded file in the server folder
    credential: admin.credential.cert(serviceAccountKey)
});

mongoose.connect(process.env.DB_LOCATION, {
    autoIndex: true
});


server.use('/', authRoutes);
server.use('/', blogRoutes);
server.use('/', commentRoutes);
// server.use('/', notificationRoutes);
server.use('/', userRoutes);

/*
server.post("/add-comment", verifyJWT, (req, res) => {

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

})

server.post("/get-blog-comments", (req, res) => {

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

})

server.post("/get-replies", (req, res) => {

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

})

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

server.post("/delete-comment", verifyJWT, (req, res) => {

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

})
*/

server.get("/new-notification", verifyJWT, (req, res) => {

    let user_id = req.user;

    Notification.exists({ notification_for: user_id, seen: false, user: { $ne: user_id } }) // to remove the users own activity/notification
    .then(result => {
        if (result) {
            return res.status(200).json({ new_notification_available: true })
        } else {
            return res.status(200).json({ new_notification_available: false })
        }
    })
    .catch(err => {
        return res.status(500).json({ error: err.message })
    })

})

server.post("/notifications", verifyJWT, (req, res) => {
    let user_id = req.user;

    let { page, filter, deletedDocCount } = req.body;

    let maxLimit = 10;

    let findQuery = { notification_for: user_id, user: { $ne: user_id } };

    let skipDocs = ( page - 1 ) * maxLimit;

    if (filter != "all") {
        findQuery.type = filter;
    }

    if (deletedDocCount) { // to skip the docs which are deleted in the front end
        skipDocs -= deletedDocCount;
    }

    Notification.find(findQuery)
    .skip(skipDocs)
    .limit(maxLimit)
    .populate("blog", "title blog_id")
    .populate("user", "personal_info.fullname personal_info.username personal_info.profile_img")
    .populate("comment", "comment")
    .populate("replied_on_comment", "comment")
    .populate("reply", "comment")
    .sort({ createdAt: -1 }) // latest first
    .select("createdAt type seen reply")
    .then(notifications => {

        Notification.updateMany(findQuery, { seen: true })
        .skip(skipDocs)
        .limit(maxLimit)
        .then(() => console.log("notification seen"))

        return res.status(200).json({ notifications });
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({ error: err.message });
    })

})

server.post("/all-notifications-count", verifyJWT, (req, res) => {

    let user_id = req.user;

    let { filter } = req.body;

    let findQuery = { notification_for: user_id, user: { $ne: user_id } }
        
    if (filter != "all") {
        findQuery.type = filter;
    }

    Notification.countDocuments(findQuery)
    .then(count => {
        return res.status(200).json({ totalDocs: count });
    })
    .catch(err => {
        return res.status(500).json({ error: err.message });
    })

})

server.listen(PORT, () => {
    console.log("listening on port: " + PORT);
});