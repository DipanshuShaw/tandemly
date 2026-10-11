import express from "express";

import { submitFeedback, getFeaturedFeedback } from "../controllers/feedbackController";

const router = express.Router();

router.get("/featured", getFeaturedFeedback);

router.post("/", submitFeedback);

export default router;
