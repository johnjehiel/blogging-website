import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { UserContext } from "../App";
import AboutUser from "../components/about.component";
import { filterPaginationData } from "../common/filter-pagination-data";
import InPageNavigation from "../components/inpage-navigation.component";
import BlogPostCard from "../components/blog-post.component";
import NoDataMessage from "../components/nodata.component";
import LoadMoreDataBtn from "../components/load-more.component";
import PageNotFound from "./404.page";

export const profileDataStructure = {
    personal_info: {
        fullname: "",
        username: "",
        profile_img: "",
        bio: ""
    },
    account_info: {
        total_posts: 0,
        total_reads: 0
    },
    social_links: {  },
    joinedAt: " "
}

const ProfilePage = () => {

    let { id: profileId } = useParams();

    let [ profile, setProfile ] = useState(profileDataStructure); // initialize with empty datastructure so that we can destructure it in the following line
    let [ loading, setLoading ] = useState(true);
    let [ blogs, setBlogs ] = useState(null);
    let [ profileLoaded, setProfileLoaded ] = useState("");

    let { personal_info: { fullname, username: profile_username, profile_img, bio }, account_info: { total_posts, total_reads }, social_links, joinedAt } = profile;

    let { userAuth: { username } } = useContext(UserContext);

    const fetchUserProfile = () => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-profile", { username: profileId })
        .then(({ data: user }) => {
            // console.log(user);
            if (user != null) {
                setProfile(user);
                // can the following 2 lines be present outside of the if block ?? 
                setProfileLoaded(profileId);
                getBlogs({ user_id: user._id }); // user object has the _id
            }
            setLoading(false);
        })
        .catch(err => {
            console.log(err);
            setLoading(false);
        })
    }

    const getBlogs = ({ page = 1, user_id }) => {

        user_id = user_id == undefined ? blogs.user_id : user_id; // calling it for the first time or already having user_id in the Blog state
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs",{
            author: user_id,
            page
        })
        .then(async ({ data }) => {
            let formatedData = await filterPaginationData({
                state: blogs,
                data: data.blogs,
                page,
                countRoute: "/search-blogs-count",
                data_to_send: { author: user_id }
            })
            formatedData.user_id = user_id; // set another key named user_id
            // console.log(formatedData);
            setBlogs(formatedData);
        })

    }

    useEffect(() => {
        if (profileId != profileLoaded) {
            setBlogs(null);
        }
        if (blogs==null) {
            resetState();
            fetchUserProfile();
        }
    }, [profileId, blogs]) // i dont think its necessary to include "blogs" in the useEffect dependency array as we only reset the blogs inside the useEffect

    const resetState = () => {
        setProfile(profileDataStructure);
        setProfileLoaded("");
        setLoading(true);
    }

    return (
        <AnimationWrapper>
            {
                loading ? <Loader /> : 
                    profile_username.length ? 
                        <section className="h-cover md:flex flex-row-reverse items.start gap-5 min-[1100px]:gap-12">
                            <div className="flex flex-col max-md:items-center gap-5 min-w-[250px] md:w-50% md:pl-8 md:border-l border-grey md:sticky md:top-[100px] md:py-10">
                                <img src={profile_img} className="w-48 h-48 bg-grey rounded-full md:w-32 md:h-32" alt="profile image" />
                                <h1 className="text-2xl font-medium">@{profile_username}</h1>
                                <p className="text-xl capitalize h-6">{fullname}</p>
                                <p>{total_posts.toLocaleString()} Blogs - {total_reads.toLocaleString()} Reads</p>
                                
                                <div className="glex gap-4 mt-2">
                                    {
                                        profileId == username ?
                                        <Link to="/settings/edit-profile" className="btn-light rounded-md">
                                            Edit Profile
                                        </Link>
                                        : " "
                                    }
                                </div>
                                <AboutUser className="max-md:hidden" bio={bio} social_links={social_links} joinedAt={joinedAt}/>
                            </div>

                            <div className="max-md:mt-12 w-full">
                                {/* InpageNavigation is similar to that which is present in the home page */}
                                <InPageNavigation routes={["Blogs Published", "About"]} defaultHidden={["About"]}> 
                                    <>
                                        {
                                        blogs==null ? (
                                            <Loader />
                                        ) : (
                                            blogs.results.length ? 
                                            blogs.results.map((blog, index) => {
                                                return <AnimationWrapper transition={{ duration: 1, delay: index*.1 }} key={index} > 
                                                <BlogPostCard content={blog} author={blog.author.personal_info} />
                                                </AnimationWrapper> // add fade in effect using i*.1
                                            })
                                            : <NoDataMessage message="No Blogs Published"/>
                                        )
                                        }
                                        <LoadMoreDataBtn state={blogs} fetchDataFunc={getBlogs} />
                                    </>
                                    {/* this time in Aboutuser we wont give the class name to hide in md screens */}
                                    <AboutUser bio={bio} social_links={social_links} joinedAt={joinedAt} />
                                
                                </InPageNavigation>
                            </div>
                        </section>
                    :
                    <PageNotFound />
            }
        </AnimationWrapper>
    )
}

export default ProfilePage;