import { Response } from "express";

import Review from "../models/Review";
import Match from "../models/Match";
import User from "../models/User";

export const createReview = async (
  req: any,
  res: Response
) => {
  try {
    const {
      matchId,
      revieweeId,
      rating,
      comment,
    } = req.body;

    if (
      !matchId ||
      !revieweeId ||
      !rating
    ) {
      return res.status(400).json({
        message:
          "matchId, revieweeId and rating are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message:
          "Rating must be between 1 and 5",
      });
    }

    const match =
      await Match.findById(matchId);

    if (!match) {
      return res.status(404).json({
        message: "Match not found",
      });
    }

    if (
      match.status !== "completed"
    ) {
      return res.status(400).json({
        message:
          "Match must be completed before reviewing",
      });
    }

    const userId =
      req.user._id.toString();

    const isLearner =
      match.learner.toString() ===
      userId;

    const isTeacher =
      match.teacher.toString() ===
      userId;

    if (
      !isLearner &&
      !isTeacher
    ) {
      return res.status(403).json({
        message:
          "You are not part of this match",
      });
    }

    if (
      isLearner &&
      match.learnerRated
    ) {
      return res.status(400).json({
        message:
          "You have already reviewed this match",
      });
    }

    if (
      isTeacher &&
      match.teacherRated
    ) {
      return res.status(400).json({
        message:
          "You have already reviewed this match",
      });
    }

    const review =
      await Review.create({
        reviewer: req.user._id,
        reviewee: revieweeId,
        match: matchId,
        rating,
        comment,
      });

    if (isLearner) {
      match.learnerRated = true;
    }

    if (isTeacher) {
      match.teacherRated = true;
    }

    await match.save();

    const reviews =
      await Review.find({
        reviewee: revieweeId,
      });

    const totalRating =
      reviews.reduce(
        (
          total,
          review
        ) =>
          total + review.rating,
        0
      );

    const averageRating =
      totalRating /
      reviews.length;

    await User.findByIdAndUpdate(
      revieweeId,
      {
        rating:
          Number(
            averageRating.toFixed(
              1
            )
          ),

        reviewCount:
          reviews.length,
      }
    );

    return res.status(201).json({
      message:
        "Review submitted successfully",
      review,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Server error",
    });
  }
};


export const getMyReviews = async (
  req: any,
  res: Response
) => {
  try {
    const reviews =
      await Review.find({
        reviewee: req.user.id,
      })
        .populate(
          "reviewer",
          "name email"
        )
        .sort({
          createdAt: -1,
        });

    return res.json(reviews);
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};