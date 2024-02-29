import { useContext, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { UserContext } from "../App";
import axios from "axios";


const NotificationCommentField = ({ _id, blog_author, index = undefined, replyingTo = undefined, setIsReplying, notification_id, notificationData }) => {

    let [ comment, setComment ] = useState("");

    let { _id: user_id } = blog_author;
    let { userAuth: { access_token } } = useContext(UserContext);
    let { notifications, notifications: { results }, setNotifications } = notificationData;

    const handleComment = () => {

        if (!comment.length) {
            return toast.error("Write something to leave comment...")
        }

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/add-comment", {
            _id, blog_author: user_id, comment, replying_to: replyingTo, notification_id // if replying to is undefined then it is a parent comment else it is a replying comment (child comment)
        }, {
            headers: {
                "Authorization": `Bearer ${access_token}`
            }
        })
        .then(({ data }) => {
            
            setIsReplying(false);

            results[index].reply = { comment, _id: data._id };

            setNotifications({ ...notifications, results });
            
        })
        .catch(err => {
            console.log(err);
        })
    }

    return (
        <>
            <Toaster />
            <textarea className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto"
                      onChange={(e) => setComment(e.target.value)}
                      value={comment}
                      placeholder="leave a reply..."></textarea>
            <button className="btn-dark mtt-5 px-10" onClick={handleComment}>Reply</button>
        </>
    )
}

export default NotificationCommentField;