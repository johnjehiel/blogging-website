import express from "express";
import { newNotification, notifications, allNotificationsCount } from "../controllers/notificationController.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";

const router = express.Router();

router.get("/new-notification", verifyJWT, newNotification);
router.post("/notifications", verifyJWT, notifications);
router.post("/all-notifications-count", verifyJWT, allNotificationsCount);

export default router;