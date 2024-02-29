import { useEffect, useState } from 'react';
import AnimationWrapper from '../common/page-animation';
import InPageNavigation from '../components/inpage-navigation.component';
import Loader from "../components/loader.component";
import BlogPostCard from '../components/blog-post.component';
import MinimalBlogPost from '../components/nobanner-blog-post.component'
import { activeTabRef } from "../components/inpage-navigation.component"
import axios from "axios";
import NoDataMessage from '../components/nodata.component';
import { filterPaginationData } from '../common/filter-pagination-data';
import LoadMoreDataBtn from '../components/load-more.component';

const HomePage = () => {

  const [ latestBlogs, setLatestBlogs ] = useState(null); // { results, page, totalDocs }
  const [ trendingBlogs, setTrendingBlogs ] = useState(null);
  const [ pageState, setPageState ] = useState("home"); 

  let categories = ["programming", "problem solving", "AI", "ML", "DL", "medicine", "cloud"]

  const fetchLatestBlogs = ({page = 1}) => {
    axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs", { page })
    .then(async ({ data }) => { // axios response is always a data object so we destructure it to get the blogs content
      //console.log(data.blogs);
      
      let formatedData = await filterPaginationData({
        state: latestBlogs,
        data: data.blogs,
        page,
        countRoute: "/all-latest-blogs-count"
      })
      //console.log(formatedData);
      setLatestBlogs(formatedData);
    })
    .catch(err => {
      console.log(err.message);
    })
  }

  const fetchBlogsByCategory = ({ page = 1 }) => {
    axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", { tag: pageState, page })
    .then( async ({ data }) => { // axios response is always a data object so we destructure it to get the blogs content
      
      let formatedData = await filterPaginationData({
        state: latestBlogs,
        data: data.blogs,
        page,
        countRoute: "/search-blogs-count",
        data_to_send: { tag: pageState }
      })
      //console.log(formatedData);
      setLatestBlogs(formatedData); // we set the blogs of that current PAGESTATE category to the latest blogs !!!
    })
    .catch(err => {
      console.log(err.message);
    })
  }

  const fetchTrendingBlogs = () => {
    axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/trending-blogs")
    .then(({ data }) => { // axios response is always a data object so we destructure it to get the blogs content
      setTrendingBlogs(data.blogs);
    })
    .catch(err => {
      console.log(err.message);
    })
  }

  const loadBlogByCategory = (e) => {
    
    let category = e.target.innerText.toLowerCase();

    setLatestBlogs(null);

    if (pageState == category) {
      setPageState("home");
      return ;
    }

    setPageState(category);

  }

  useEffect(() => {

    activeTabRef.current.click(); // to automatically click the button which will highlight the button bottom margin to fit the text size

    if (pageState == "home") {
      fetchLatestBlogs({ page: 1 });
    } else {
      fetchBlogsByCategory({ page: 1 });
    }
    if (!trendingBlogs) {
      fetchTrendingBlogs();
    }
  }, [pageState]);

  return (
    <AnimationWrapper>
        <section className="h-cover flex justify-center gap-10">
            {/* latest blogs (left side)*/}
            <div className="w-full">
                <InPageNavigation routes={[pageState, "trending blogs"]} defaultHidden={["trending blogs"]}>
                  <>
                    {
                      latestBlogs==null ? (
                        <Loader />
                      ) : (
                        latestBlogs.results.length ? 
                          latestBlogs.results.map((blog, index) => {
                            return <AnimationWrapper transition={{ duration: 1, delay: index*.1 }} key={index} > 
                              <BlogPostCard content={blog} author={blog.author.personal_info} />
                            </AnimationWrapper> // add fade in effect using i*.1
                          })
                        : <NoDataMessage message="No Blogs Published"/>
                      )
                    }
                    <LoadMoreDataBtn state={latestBlogs} fetchDataFunc={( pageState == "home" ? fetchLatestBlogs : fetchBlogsByCategory )} />
                  </>
                    
                    {
                      trendingBlogs==null ? (
                        <Loader />
                      ) : (
                        trendingBlogs.length ?
                        trendingBlogs.map((blog, index) => {
                          return <AnimationWrapper transition={{ duration: 1, delay: index*.1 }} key={index} > 
                            <MinimalBlogPost blog={blog} index={index} />
                          </AnimationWrapper> // add fade in effect using i*.1
                          })
                        : <NoDataMessage message="No Blogs Published"/>
                      ) 
                    }
                
                </InPageNavigation>
            </div>
            
            {/* filters and trending blogs (right side, which is hidden for medium to small screens) */}
            <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">

                <div className="flex flex-col gap-10">

                    <div>
                        <h1 className="font-medium text-xl mb-8">Stories from all interests</h1>
                        <div className="flex gap-3 flex-wrap">
                            {
                              categories.map((category, index) => {
                                  return <button className={"tag " + (pageState.toLowerCase() == category.toLowerCase() ? "bg-black text-white" : "")} onClick={loadBlogByCategory} key={index}>
                                          { category }
                                        </button>
                              })
                            }
                        </div>
                    </div>

                    <div>
                        <h1 className="font-medium text-xl mb-8"> Trending <i className="fi fi-rr-arrow-trend-up"></i> </h1>
                    
                        {
                          trendingBlogs==null ? (
                            <Loader />
                          ) : (
                            trendingBlogs.length ? 
                            trendingBlogs.map((blog, index) => {
                              return <AnimationWrapper transition={{ duration: 1, delay: index*.1 }} key={index} > 
                                <MinimalBlogPost blog={blog} index={index} />
                              </AnimationWrapper> // add fade in effect using i*.1
                            })
                            : <NoDataMessage message="No Blogs Published"/>
                          ) 
                        }
                    </div>
   
                </div>

            </div>

        </section>
    </AnimationWrapper>
  )
}

export default HomePage;