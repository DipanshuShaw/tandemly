import express from "express";
import { getAllUsers, getCurrentMatch, getUserProfile,getUserSkills,getUserWallet,updateUserProfile, updateUserSkills } from "../controllers/userController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// GET /api/user/profile
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile); // ✅ new route for updating
router.get("/current-match", protect, getCurrentMatch); // ✅ Add this route
router.get("/skills", protect, getUserSkills);
router.put("/skills", protect, updateUserSkills);
router.get("/all", protect, getAllUsers);
router.get("/wallet", protect, getUserWallet);




export default router;
