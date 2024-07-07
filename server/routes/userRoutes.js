import express from "express";
import { searchUsers, getProfile, userWrittenBlogs, userWrittenBlogsCount } from "../controllers/userController.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";

const router = express.Router();

router.post("/search-users", searchUsers);
router.post("/get-profile", getProfile);
router.post("/user-written-blogs", verifyJWT, userWrittenBlogs);
router.post("/user-written-blogs-count", verifyJWT, userWrittenBlogsCount);

export default router;
