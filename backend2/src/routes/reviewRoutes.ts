import express from "express";

import {
  createReview,
  getMyReviews,
  getFeaturedReviews,
} from "../controllers/reviewController";


import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// Public — used by the landing page's testimonials section.
router.get(
  "/featured",
  getFeaturedReviews
);

router.post(
  "/",
  protect,
  createReview
);

router.get(
  "/me",
  protect,
  getMyReviews
);

export default router;
