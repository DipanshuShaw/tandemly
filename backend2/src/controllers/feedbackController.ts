import { Request, Response } from "express";

import Feedback from "../models/Feedback";

/* =====================================
   SUBMIT FEEDBACK (PUBLIC)
   General product feedback from anyone —
   visitor or user — via the landing page.
===================================== */

export const submitFeedback = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, email, rating, message } = req.body;

    if (!name || !email || !rating || !message) {
      return res.status(400).json({
        message:
          "Name, email, rating, and message are all required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    const feedback = await Feedback.create({
      name,
      email,
      rating,
      message,
    });

    return res.status(201).json({
      message: "Thanks for the feedback!",
      feedback,
    });
  } catch (error) {
    console.error("Submit Feedback Error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

/* =====================================
   GET FEATURED FEEDBACK (PUBLIC)
   Highly-rated general feedback, shown
   alongside match reviews as landing-page
   testimonials.
===================================== */

export const getFeaturedFeedback = async (
  _req: Request,
  res: Response
) => {
  try {
    const feedback = await Feedback.find({
      rating: { $gte: 4 },
    })
      .sort({ rating: -1, createdAt: -1 })
      .limit(9)
      .select("name rating message createdAt")
      .lean();

    return res.json(feedback);
  } catch (error) {
    console.error("Get Featured Feedback Error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
