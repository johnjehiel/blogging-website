import { nanoid } from "nanoid";
import Blog from "../models/Blog.js";
import Notification from "../models/Notification.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";

export const latestBlogs = async (req, res) => {
    
    let { page } = req.body;

    let maxLimit = 5;
    Blog.find({ draft: false })
    .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
    .sort({ "publishedAt": -1 }) // sort by recency of the blog
    .select("blog_id title des banner activity tags publishedAt -_id")
    .skip((page - 1)*maxLimit) // to skip documents
    .limit(maxLimit)
    .then(blogs => {
        return res.status(200).json({ blogs })
    })
    .catch(err => {
        return res.status(500).json({ error: err.message });
    })

}

export const allLatestBlogsCount = async (req, res) => {
    
    Blog.countDocuments({ draft: false })
    .then(count => {
        return res.status(200).json({ totalDocs: count });
    })
    .catch(err => {
        console.log(err.message);
        return res.status(500).json({ error: err.message });
    })

}

export const trendingBlogs = async (req, res) => {

    Blog.find({ draft: false })
    .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
    .sort({ "activity.total_reads": -1, "activity.total_likes": -1, "publishedAt": -1 })
    .select("blog_id title publishedAt -_id")
    .limit(5)
    .then(blogs => {
        return res.status(200).json({ blogs })
    })
    .catch(err => {
        return res.status(500).json({ error: err.message })
    })

}

export const searchBlogs = async (req, res) => {

    let { tag, query, author, page, limit, eliminate_blog } = req.body; // we receive the tag which is sent through axios post from home.page and destructure it from the req body

    let findQuery;
    if (tag) {
        findQuery = { tags: tag, draft: false, blog_id: { $ne: eliminate_blog } };
    } else if (query) {
        findQuery = { draft: false, title: new RegExp(query, 'i') }; // 'i' => no case sensitivity
    } else if (author) {
        findQuery = { author, draft: false };
    }
    let maxLimit = limit ? limit : 2;

    Blog.find(findQuery)
    .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
    .sort({ "publishedAt": -1 }) // sort by recency of the blog
    .select("blog_id title des banner activity tags publishedAt -_id")
    .skip((page - 1) * maxLimit)
    .limit(maxLimit)
    .then(blogs => {
        return res.status(200).json({ blogs })
    })
    .catch(err => {
        return res.status(500).json({ error: err.message });
    })
}

export const searchBlogsCount = async (req, res) => {
    
    let { tag, author, query } = req.body;
    let findQuery;
    
    if (tag) {
        findQuery = { tags: tag, draft: false };
    } else if (query) {
        findQuery = { draft: false, title: new RegExp(query, 'i') }; // 'i' => no case sensitivity
    } else if (author) {
        findQuery = { author, draft: false };
    }

    Blog.countDocuments(findQuery)
    .then(count => {
        return res.status(200).json({ totalDocs: count });
    })
    .catch(err => {
        console.log(err.message);
        return res.status(500).json({ error: err.message });
    })
}

export const createBlog = async (req, res) => {

    let authorId = req.user;
    let { title, des, banner, tags, content, draft, id } = req.body;
    
    if (!title.length) {
        return res.status(403).json({ "error": "Must provide title"});
    }

    if (!draft) {
        if (!des.length || des.length > 200) {
            return res.status(403).json({ "error": "Must provide blog description to publish"});
        }
        if (!banner.length) {
            return res.status(403).json({ "error": "Must provide blog banner to publish"});
        }
        if (!content.blocks.length) {
            return res.status(403).json({ "error": "No Blog Content provided"});
        } 
        if (!tags.length) {
            return res.status(403).json({ "error": "Must Provide Tags"});
        } 
        if (tags.length > 10) {
            return res.status(403).json({ "error": "Maximum tags: 10" });
        }
    }
  
    tags = tags.map(tag => tag.toLowerCase());

    let blog_id = id || title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, "-").trim() + nanoid();
    
    if (id) {
        Blog.findOneAndUpdate({ blog_id }, { title, des, banner, content, tags, draft: draft ? draft : false })
        .then(() => {
            return res.status(200).json({ id: blog_id });
        })
        .catch(err => {
            return res.status(500).json({ error: "failed to update post" });
        })
    } else {
        let blog = new Blog({
            title, des, banner, content, tags, author: authorId, blog_id, draft: Boolean(draft) // Boolean(undefined) = false
        })
    
    
        blog.save().then(blog => {
            
            let incrementVal = draft ? 0 : 1;
    
            User.findOneAndUpdate({ _id: authorId }, { $inc: { "account_info.total_posts": incrementVal }, $push: { "blogs": blog._id } })
            .then(user => {
                return res.status(200).json({ id: blog.blog_id })
            })
            .catch(err => {
                return res.status(500).json({ error: "Failed to update total posts" })
            })
    
        })
        .catch(err => {
            return res.status(500).json({ error: err.message })
        })
    }

}

export const getBlog = async (req, res) => {

    let { blog_id, draft, mode } = req.body;

    let incrementalVal = mode != "edit" ? 1 : 0;

    // NOTE: the findOneAndUpdate() will not provide he updated document. instead it provides the document first and then updates it
    Blog.findOneAndUpdate({ blog_id }, { $inc: { "activity.total_reads": incrementalVal } }) // we use update as well because we want to increase the total_reads by 1
    .populate("author", "personal_info.fullname personal_info.username personal_info.profile_img")
    .select("title des content banner activity publishedAt blog_id tags")
    .then(blog => {
        User.findOneAndUpdate({ "personal_info.username": blog.author.personal_info.username }, {
            $inc: { "account_info.total_reads": incrementalVal }
        })
        .catch(err => {
            return res.status(500).json({ error: err.message })
        })

        if (blog.draft && !draft) {
            return res.status(500).json({ error: "you cannot access draft blogs" });
        }

        return res.status(200).json({ blog })
    })
    .catch(err => {
        return res.status(500).json({ error: err.message })
    })

}

export const likeBlog = async (req, res) => { // we only want the logged in user to like the blog

    let user_id = req.user;

    let { _id, isLikedByUser } = req.body;

    let incrementalVal = !isLikedByUser ? 1 : -1;

    Blog.findOneAndUpdate({ _id }, { $inc: { "activity.total_likes": incrementalVal } })
    .then(blog => {

        if (!isLikedByUser) {
            let like = new Notification({
                type: "like",
                blog: _id,
                notification_for: blog.author,
                user: user_id
            })

            like.save().then(notification => {
                return res.status(200).json({ liked_by_user: true })
            })
        } else {
            Notification.findOneAndDelete({ user: user_id, blog: _id, type: "like" })
            .then(data => {
                return res.status(200).json({ liked_by_user: false })
            })
            .catch(err => {
                return res.status(500).json({ error: err.message })
            })
        }

    })

}

export const isLikedByUser = async (req, res) => {
    let user_id = req.user;

    let { _id } = req.body;

    Notification.exists({ user: user_id, type: "like", blog: _id })
    .then(result => {
        return res.status(200).json({ result }) // {result: true/false}
    })
    .catch(err => {
        return res.status(500).json({ error: err.message })
    })
}

export const deleteBlog = async (req, res) => {

    let user_id = req.user;
    let { blog_id } = req.body;

    Blog.findOneAndDelete({ blog_id })
    .then(blog => {

        Notification.deleteMany({ blog: blog._id })
        .then(data => console.log("Notifications deleted"));

        Comment.deleteMany({ blog_id: blog._id })
        .then(data => console.log("Comments deleted"));

        User.findOneAndUpdate({ _id: user_id }, { $pull: { blog: blog._id }, $inc: { "account_info.total_posts": -1 } })
        .then(user => console.log("Blog deleted"));

        return res.status(200).json({ status: "done" });
    })
    .catch(err => {
        return res.status(500).json({ error: err.message });
    })

}