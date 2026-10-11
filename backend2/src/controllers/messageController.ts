import { Response } from "express";

import Message from "../models/Message";
import Match from "../models/Match";

/* =====================================
   GET ALL CONVERSATIONS (INBOX)
   One entry per match (active + completed),
   with the last message and unread count.
===================================== */

export const getConversations = async (
  req: any,
  res: Response
) => {
  try {
    const userId = req.user._id;

    const matches = await Match.find({
      $or: [
        { learner: userId },
        { teacher: userId },
      ],
    })
      .populate("learner", "name email profilePicture")
      .populate("teacher", "name email profilePicture")
      .populate("learningSkill", "name")
      .populate("teachingSkill", "name")
      .sort({ updatedAt: -1 })
      .lean();

    const matchIds = matches.map((m) => m._id);

    // Last message + unread count for every match in two queries
    // total, instead of two extra round-trips per match — this used
    // to be O(2N) database calls for an inbox with N conversations.
    // The sender on the last message is joined via $lookup directly
    // in the pipeline (rather than a follow-up Model.populate() call
    // on the aggregated output) since "lastMessage" isn't a real
    // schema path and populate can't reliably resolve it there.
    const [lastMessages, unreadCounts] = await Promise.all([
      Message.aggregate([
        { $match: { match: { $in: matchIds } } },
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: "$match",
            lastMessage: { $first: "$$ROOT" },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "lastMessage.sender",
            foreignField: "_id",
            as: "senderInfo",
          },
        },
        {
          $addFields: {
            "lastMessage.sender": {
              _id: { $arrayElemAt: ["$senderInfo._id", 0] },
              name: { $arrayElemAt: ["$senderInfo.name", 0] },
            },
          },
        },
        { $project: { senderInfo: 0 } },
      ]),

      Message.aggregate([
        {
          $match: {
            match: { $in: matchIds },
            sender: { $ne: userId },
            isRead: false,
          },
        },
        {
          $group: {
            _id: "$match",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const lastMessageByMatch = new Map(
      lastMessages.map((entry) => [
        entry._id.toString(),
        entry.lastMessage,
      ])
    );

    const unreadByMatch = new Map(
      unreadCounts.map((entry) => [
        entry._id.toString(),
        entry.count,
      ])
    );

    const conversations = matches.map((match) => ({
      match,
      lastMessage:
        lastMessageByMatch.get(match._id.toString()) || null,
      unreadCount:
        unreadByMatch.get(match._id.toString()) || 0,
    }));

    return res.json({ conversations });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

/* =====================================
   GET MESSAGES FOR A MATCH
===================================== */

export const getMessages = async (
  req: any,
  res: Response
) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findById(matchId);

    if (!match) {
      return res.status(404).json({
        message: "Match not found",
      });
    }

    const userId = req.user._id.toString();

    const isParticipant =
      match.learner.toString() === userId ||
      match.teacher.toString() === userId;

    if (!isParticipant) {
      return res.status(403).json({
        message: "Not authorized for this match",
      });
    }

    const messages = await Message.find({
      match: matchId,
    })
      .sort({ createdAt: 1 })
      .populate("sender", "name profilePicture")
      .lean();

    return res.json({
      messages,
      chatEnabled: match.chatEnabled,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
