import express from "express";

import {
  createReview,
  getMyReviews
} from "../controllers/reviewController";


import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post(
  "/",
  protect,
  createReview
);

// router.get(
//   "/:userId",
//   protect,
//   getUserReviews
// );

router.get(
  "/me",
  protect,
  getMyReviews
);

export default router;