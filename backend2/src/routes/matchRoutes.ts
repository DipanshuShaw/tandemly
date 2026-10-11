import express from "express";

import {
  createMatchRequest,
  getReceivedRequests,
  getSentRequests,
  acceptMatchRequest,
  rejectMatchRequest,
  getActiveMatches,
  completeMatch,
  getRecommendedMatches,
  getMatchHistory,
} from "../controllers/matchController";

import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post(
  "/request",
  protect,
  createMatchRequest
);

router.get(
  "/received",
  protect,
  getReceivedRequests
);

router.get(
  "/sent",
  protect,
  getSentRequests
);

router.post(
  "/accept",
  protect,
  acceptMatchRequest
);

router.post(
  "/reject",
  protect,
  rejectMatchRequest
);

router.get(
  "/active",
  protect,
  getActiveMatches
);

router.post(
  "/complete",
  protect,
  completeMatch
);

router.get(
  "/recommended",
  protect,
  getRecommendedMatches
);

router.get(
  "/history",
  protect,
  getMatchHistory
);

export default router;