import express from "express";
import { createBlog, getBlog, likeBlog, isLikedByUser, latestBlogs, allLatestBlogsCount, trendingBlogs, searchBlogs, searchBlogsCount, deleteBlog } from "../controllers/blogController.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";

const router = express.Router();

router.post("/latest-blogs", latestBlogs);
router.post("/all-latest-blogs-count", allLatestBlogsCount);
router.get("/trending-blogs", trendingBlogs);
router.post("/search-blogs", searchBlogs);
router.post("/search-blogs-count", searchBlogsCount);
router.post("/create-blog", verifyJWT, createBlog);
router.post("/get-blog", getBlog);
router.post("/like-blog", verifyJWT, likeBlog);
router.post("/isliked-by-user", verifyJWT, isLikedByUser);
router.post("/delete-blog", verifyJWT, deleteBlog);

export default router;