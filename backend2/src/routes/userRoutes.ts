import express from "express";

import {
  getProfile,
  addOfferedSkill,
  addWantedSkill,
  updateProfile,
  discoverUsers,
  removeOfferedSkill,
  removeWantedSkill,
  getWallet
} from "../controllers/userController";

import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.get(
  "/profile",
  protect,
  getProfile
);

router.post(
  "/skills/offered",
  protect,
  addOfferedSkill
);

router.post(
  "/skills/wanted",
  protect,
  addWantedSkill
);



router.put(
  "/profile",
  protect,
  updateProfile
);

router.get(
  "/discover",
  protect,
  discoverUsers
);



router.delete(
  "/skills/offered/:skillId",
  protect,
  removeOfferedSkill
);

router.delete(
  "/skills/wanted/:skillId",
  protect,
  removeWantedSkill
);

router.get(
"/wallet",
protect,
getWallet
);




export default router;