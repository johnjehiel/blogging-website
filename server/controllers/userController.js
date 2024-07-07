import Blog from "../models/Blog.js";
import User from "../models/User.js";


export const searchUsers = async (req, res) => {
    let { query } = req.body;
    
    User.find({ "personal_info.username": new RegExp(query, 'i') }) // as per defined user schema
    .limit(50)
    .select("personal_info.fullname personal_info.username personal_info.profile_img -_id")
    .then(users => {
        return res.status(200).json({ users });
    })
    .catch(err => {
        return res.status(500).json({ error: err.message });
    })

}

export const getProfile = async (req, res) => {
    
    let { username } = req.body;

    User.findOne({ "personal_info.username": username })
    .select("-personal_info.password -google_auth -updateAt -blogs")
    .then(user => {
        return res.status(200).json(user) // user itself is an object so no need to surround it with curly-braces
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({ error: err.message });
    })

}

export const userWrittenBlogs = async (req, res) => {
    
    let user_id = req.user;

    let { page, draft, query, deletedDocCount } = req.body;

    let maxLimit = 5;
    let skipDocs = (page - 1) * maxLimit;

    if (deletedDocCount) {
        skipDocs -= deletedDocCount;
    }

    Blog.find({ author: user_id, draft, title: new RegExp(query, 'i') })
    .skip(skipDocs)
    .limit(maxLimit)
    .sort({ publishedAt: -1 })
    .select(" title banner publishedAt blog_id activity des draft -_id ")
    .then(blogs => {
        return res.status(200).json({ blogs });
    })
    .catch(err => {
        return res.status(500).json({ error: err.message });
    })

}

export const userWrittenBlogsCount = async (req, res) => {

    let user_id = req.user;

    let { draft, query } = req.body;

    Blog.countDocuments({ author: user_id, draft, title: new RegExp(query, 'i') })
    .then(count => {
        return res.status(200).json({ totalDocs: count });
    })
    .catch(err => {
        console.log(err.message);
        return res.status(500).json({ error: err.message });
    })
    
}