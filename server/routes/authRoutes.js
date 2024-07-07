import express from "express";
import { signup, signin, googleAuth, changePassword, updateProfileImage, updateProfile } from "../controllers/authController.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/google-auth", googleAuth);
router.post("/change-password", verifyJWT, changePassword);
router.post("/update-profile-image", verifyJWT, updateProfileImage);
router.post("/update-profile", verifyJWT, updateProfile);

export default router;