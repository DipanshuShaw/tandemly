import { Response } from "express";

import Session from "../models/Session";
import Match from "../models/Match";

const isParticipant = (match: any, userId: string) =>
  match.learner.toString() === userId ||
  match.teacher.toString() === userId;

/* =====================================
   PROPOSE A SESSION
===================================== */

export const proposeSession = async (
  req: any,
  res: Response
) => {
  try {
    const userId = req.user._id.toString();

    const { matchId, scheduledTime, duration, notes } = req.body;

    if (!matchId || !scheduledTime) {
      return res.status(400).json({
        message: "matchId and scheduledTime are required",
      });
    }

    const match = await Match.findById(matchId);

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    if (!isParticipant(match, userId)) {
      return res.status(403).json({
        message: "Not authorized for this match",
      });
    }

    if (match.status !== "active") {
      return res.status(400).json({
        message: "This match is no longer active",
      });
    }

    const when = new Date(scheduledTime);

    if (isNaN(when.getTime()) || when.getTime() < Date.now()) {
      return res.status(400).json({
        message: "scheduledTime must be a valid time in the future",
      });
    }

    const session = await Session.create({
      match: matchId,
      proposedBy: userId,
      scheduledTime: when,
      duration: duration || 30,
      notes: notes || "",
    });

    const populated = await session.populate(
      "proposedBy",
      "name profilePicture"
    );

    const io = req.app.get("io");

    if (io) {
      io.to(`match:${matchId}`).emit("session_proposed", populated);

      const otherUserId =
        match.learner.toString() === userId
          ? match.teacher.toString()
          : match.learner.toString();

      io.to(otherUserId).emit("session_proposed", populated);
    }

    return res.status(201).json(populated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* =====================================
   RESPOND TO A PROPOSED SESSION
===================================== */

export const respondToSession = async (
  req: any,
  res: Response
) => {
  try {
    const userId = req.user._id.toString();

    const { sessionId, action } = req.body;

    if (!["confirm", "decline"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const match = await Match.findById(session.match);

    if (!match || !isParticipant(match, userId)) {
      return res.status(403).json({
        message: "Not authorized for this session",
      });
    }

    if (session.proposedBy.toString() === userId) {
      return res.status(400).json({
        message: "You can't respond to your own proposal",
      });
    }

    if (session.status !== "proposed") {
      return res.status(400).json({
        message: "This session has already been responded to",
      });
    }

    session.status = action === "confirm" ? "confirmed" : "declined";

    await session.save();

    const io = req.app.get("io");

    if (io) {
      io.to(`match:${session.match}`).emit(
        "session_updated",
        session
      );

      io.to(session.proposedBy.toString()).emit(
        "session_updated",
        session
      );
    }

    return res.json(session);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* =====================================
   CANCEL A SESSION
===================================== */

export const cancelSession = async (
  req: any,
  res: Response
) => {
  try {
    const userId = req.user._id.toString();

    const { sessionId } = req.body;

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const match = await Match.findById(session.match);

    if (!match || !isParticipant(match, userId)) {
      return res.status(403).json({
        message: "Not authorized for this session",
      });
    }

    if (!["proposed", "confirmed"].includes(session.status)) {
      return res.status(400).json({
        message: "This session can no longer be cancelled",
      });
    }

    session.status = "cancelled";

    await session.save();

    const io = req.app.get("io");

    if (io) {
      io.to(`match:${session.match}`).emit("session_updated", session);
    }

    return res.json(session);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* =====================================
   GET SESSIONS FOR A MATCH
===================================== */

export const getSessionsForMatch = async (
  req: any,
  res: Response
) => {
  try {
    const userId = req.user._id.toString();

    const { matchId } = req.params;

    const match = await Match.findById(matchId);

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    if (!isParticipant(match, userId)) {
      return res.status(403).json({
        message: "Not authorized for this match",
      });
    }

    const sessions = await Session.find({ match: matchId })
      .sort({ scheduledTime: 1 })
      .populate("proposedBy", "name profilePicture");

    return res.json(sessions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* =====================================
   GET MY UPCOMING (CONFIRMED) SESSIONS
   Across every active match — used to show a
   "next session" hint on the match card.
===================================== */

export const getUpcomingSessions = async (
  req: any,
  res: Response
) => {
  try {
    const userId = req.user._id;

    const myMatches = await Match.find({
      $or: [{ learner: userId }, { teacher: userId }],
    }).select("_id");

    const matchIds = myMatches.map((m) => m._id);

    const sessions = await Session.find({
      match: { $in: matchIds },
      status: "confirmed",
      scheduledTime: { $gte: new Date() },
    }).sort({ scheduledTime: 1 });

    return res.json(sessions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
