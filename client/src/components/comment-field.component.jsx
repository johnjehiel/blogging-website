import { useContext, useState } from "react";
import { UserContext } from "../App";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { BlogContext } from "../pages/blog.page";

const CommentField = ({ action, index = undefined, replyingTo = undefined, setIsReplying }) => { // action => either comment or reply
    
    let { blog, blog: { _id, author: { _id: blog_author }, comments, comments: { results: commentsArr }, activity, activity: { total_comments, total_parent_comments } }, setBlog, setTotalParentCommentsLoaded } = useContext(BlogContext)

    let { userAuth: { access_token, username, fullname, profile_img } } = useContext(UserContext);

    const [ comment, setComment ] = useState("");

    const handleComment = () => {

        if (!access_token) {
            return toast.error("login to leave comment");
        }
        if (!comment.length) {
            return toast.error("Write something to leave comment...")
        }

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/add-comment", {
            _id, blog_author, comment, replying_to: replyingTo // if replying to is undefined then it is a parent comment else it is a replying comment (child comment)
        }, {
            headers: {
                "Authorization": `Bearer ${access_token}`
            }
        })
        .then(({ data }) => {

            setComment("");
            data.commented_by = { personal_info: { username, profile_img, fullname } };

            let newCommentArr;

            if (replyingTo) {

                commentsArr[index].children.push(data._id);

                data.childrenLevel = commentsArr[index].childrenLevel + 1
                data.parentIndex = index;

                commentsArr[index].isReplyLoaded = true; // add new key to make card underneath

                commentsArr.splice(index + 1, 0, data); // [1, 2, 3] => {2: 4} => [1, 2, 4, 3]

                newCommentArr = commentsArr;

                setIsReplying(false);

            } else {

                data.childrenLevel = 0;
    
                newCommentArr = [ data, ...commentsArr ] // destructure the previous comment array to include previous comments
     
            }

            let parentCommentIncrementVal = replyingTo ? 0 : 1;

            setBlog({ ...blog, "comments": { ...comments, results: newCommentArr }, activity: { ...activity, total_comments: total_comments + 1, total_parent_comments: total_parent_comments + parentCommentIncrementVal } })

            setTotalParentCommentsLoaded(preVal => preVal + parentCommentIncrementVal);
            

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
                      placeholder="leave a comment..."></textarea>
            <button className="btn-dark mtt-5 px-10" onClick={handleComment}>{action}</button>
        </>
    )
}

export default CommentField;