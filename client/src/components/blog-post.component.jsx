import { getDay } from "../common/date";
import { Link } from "react-router-dom"
const BlogPostCard = ({ content, author }) => {

    let { publishedAt, tags, title, des, banner, activity: { total_likes }, blog_id: id } = content; // rename blog_id to id
    let { fullname, profile_img, username } = author;


    return (
        <Link to={`/blog/${id}`} className="flex gap-8 items-center border-b border-grey pb-5 mb-4 ">
             {/* <div className="inset-0 bg-gradient-to-br from-transparent to-gray-300 opacity-0 transition-opacity duration-300 hover:opacity-100"></div> */}
            <div className="w-full">
                <div className="flex gap-2 items-center mb-7">
                    <img src={profile_img} className="w-6 h-6 rounded-full" alt="profile image" />
                    <p className="line-clamp-1">{fullname} @{username}</p>
                    <p className="min-w-fit">{ getDay(publishedAt) }</p>
                </div>

                <h1 className="blog-title">{ title }</h1>
                <p className="my-3 text-cl font-gelasio leading-7 max-sm:hidden md:max-[1100px]:hidden line-clamp-2">{ des }</p>
                
                <div className="flex gap-4 mt-7">
                    <span className="btn-light py-1 px-4">{ tags[0] }</span>
                    <span className="ml-3 flex items-center gap-2 text-dark-grey">
                        <i className="fi fi-rr-heart text-xl"></i>
                        { total_likes }    
                    </span>
                </div>
            </div>

            <div className="h-28 aspect-square">
                <img src={banner} className="w-full h-full aspect-square rounded-lg object-square" alt="banner" />
            </div>
        </Link>
    )
}

export default BlogPostCard;
/*
line-clamp-1 hides the the overflow in only one line
*/