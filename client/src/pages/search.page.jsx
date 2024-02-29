import { useParams } from "react-router-dom";
import InPageNavigation from "../components/inpage-navigation.component";
import { useEffect, useState } from "react";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";
import NoDataMessage from "../components/nodata.component";
import BlogPostCard from "../components/blog-post.component";
import LoadMoreDataBtn from "../components/load-more.component";
import axios from "axios";
import { filterPaginationData } from "../common/filter-pagination-data";
import UserCard from "../components/usercard.component";

const SearchPage = () => {

    let { query } = useParams(); // to access parameters of the address path
    
    let [ searchBlogs, setSearchBlogs ] = useState(null);
    let [ users, setUsers ] = useState(null);
    const handleSearchBlogs = ({ page = 1, create_new_arr = false }) => {
        
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", { query, page }) // doesnt have tag so we use if-else in server.js to set findQuery accordingly
        .then(async ({ data }) => { // axios response is always a data object so we destructure it to get the blogs content
            //console.log(data.blogs);
            
            let formatedData = await filterPaginationData({
              state: searchBlogs,
              data: data.blogs,
              page,
              countRoute: "/search-blogs-count",
              data_to_send: { query },
              create_new_arr
            })
            //console.log(formatedData);
            setSearchBlogs(formatedData);
        })
        .catch(err => {
            console.log(err.message);
        })

    }

    const resetState = () => { // very important to reset data or else the existing data wont go away and still be shown while the new data is appended to the existing data
        setSearchBlogs(null);
        setUsers(null);
    }

    const fetchUsers = () => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-users", { query })
        .then(({ data: { users } }) => { // destructuring data to access users directly
            setUsers(users);
        })
    }

    useEffect(() => {
        resetState();
        handleSearchBlogs({ page: 1, create_new_arr: true }); // we should provide page parameters to avoid errors
        fetchUsers();
    }, [query])

    const UserCardWrapper = () => {
        return (
            <>
                {
                    users == null ? <Loader />:
                    
                        users.length ? users.map((user, index) => {
                            return <AnimationWrapper key={index} transition={{ duration: 1, delay: index*0.08 }}>
                                        <UserCard user={user}/>
                                    </AnimationWrapper>
                        }) : <NoDataMessage message="No Users Found"/> 
                    
                }
            </>
        )
    }

    return (
        <section className="h-cover flex justify-center gap-10 ">

            <div className="w-full">
                <InPageNavigation routes={[`Search Results from "${query}"`, "Accounts Matched"]} defaultHidden={["Accounts Matched"]}>

                    <>
                        {
                            searchBlogs==null ? (
                                <Loader />
                            ) : (
                                searchBlogs.results.length ? 
                                searchBlogs.results.map((blog, index) => {
                                    return <AnimationWrapper transition={{ duration: 1, delay: index*.1 }} key={index} > 
                                    <BlogPostCard content={blog} author={blog.author.personal_info} />
                                    </AnimationWrapper> // add fade in effect using i*.1
                                })
                                : <NoDataMessage message="No Blogs Published"/>
                            )
                        }
                        <LoadMoreDataBtn state={searchBlogs} fetchDataFunc={handleSearchBlogs} />
                    </>

                    <UserCardWrapper />

                </InPageNavigation>
            </div>
            
            <div className="min-w-[40%] lg:min-w-[350px] max-w-min border-grey pl-8 pt-3 max-md:hidden">
                
                <h1 className="font-medium text-xl mb-8">Users related to Search <i className="fi fi-rr-user mt-1 ml-1"></i> </h1>
                <UserCardWrapper />

            </div>

        </section>
    )
}

export default SearchPage;
