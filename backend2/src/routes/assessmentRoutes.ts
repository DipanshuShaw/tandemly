import express from "express";

import {
  generateAssessment,
  submitAssessment,
  getActiveForSkill,
  getAssessmentHistory,
  getAssessmentById,
} from "../controllers/assessmentController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/generate", protect, generateAssessment);

router.post("/:id/submit", protect, submitAssessment);

router.get("/active/:skillId", protect, getActiveForSkill);

router.get("/skill/:skillId", protect, getAssessmentHistory);

router.get("/:id", protect, getAssessmentById);

export default router;
