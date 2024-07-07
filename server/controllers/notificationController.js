import Notification from "../models/Notification.js";


export const newNotification = async (req, res) => {

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

}

export const notifications = async (req, res) => {
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

}

export const allNotificationsCount = async (req, res) => {

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

}