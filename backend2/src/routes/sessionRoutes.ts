import express from "express";

import {
  proposeSession,
  respondToSession,
  cancelSession,
  getSessionsForMatch,
  getUpcomingSessions,
} from "../controllers/sessionController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/upcoming", protect, getUpcomingSessions);

router.post("/propose", protect, proposeSession);

router.post("/respond", protect, respondToSession);

router.post("/cancel", protect, cancelSession);

router.get("/:matchId", protect, getSessionsForMatch);

export default router;
