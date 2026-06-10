import express from "express";
import {
  getSkills,
  getSkillById,
  createSkill,
  searchSkills,
  updateSkill,
  deleteSkill,
} from "../controllers/skillController";

import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", protect, getSkills);

router.get("/search", protect, searchSkills);

router.get("/:id", protect, getSkillById);

router.post("/", protect, createSkill);

router.put("/:id", protect, updateSkill);

router.delete("/:id", protect, deleteSkill);

export default router;