import { Request, Response } from "express";

import MatchRequest from "../models/MatchRequest";
import Match from "../models/Match";
import {
  calculateMatchScore,
} from "../services/matchmakingService";
import User from "../models/User";
import Transaction from "../models/Transaction";


export const createMatchRequest = async (
  req: any,
  res: Response
) => {
  try {
    const senderId = req.user._id;

    const {
      receiverId,
      teachSkill,
      learnSkill,
      message,
    } = req.body;

    if (
      !receiverId ||
      !teachSkill ||
      !learnSkill
    ) {
      return res.status(400).json({
        message:
          "receiverId, teachSkill and learnSkill are required",
      });
    }

    if (
      senderId.toString() ===
      receiverId
    ) {
      return res.status(400).json({
        message:
          "Cannot send request to yourself",
      });
    }

    const sender = await User.findById(
  senderId
);

if (!sender) {
  return res.status(404).json({
    message: "Sender not found",
  });
}

const skillToLearn =
  sender.skillsWanted.find(
    (s: any) =>
      s.skill.toString() ===
      learnSkill
  );

if (!skillToLearn) {
  return res.status(400).json({
    message:
      "Skill not found in your wanted skills",
  });
}

    const existing =
      await MatchRequest.findOne({
        from: senderId,
        to: receiverId,
        teachSkill,
        learnSkill,
        status: "pending",
      });

    if (existing) {
      return res.status(400).json({
        message:
          "Request already exists",
      });
    }

    const request =
      await MatchRequest.create({
        from: senderId,
        to: receiverId,
        teachSkill,
        learnSkill,
        message,
      });

    return res.status(201).json({
      message:
        "Request sent successfully",
      request,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Server error",
    });
  }
};





export const getReceivedRequests =
  async (
    req: any,
    res: Response
  ) => {
    try {
      const requests =
        await MatchRequest.find({
          to: req.user._id,
          status: "pending",
        })
          .populate(
            "from",
            "name bio rating"
          )
          .populate(
            "teachSkill"
          )
          .populate(
            "learnSkill"
          );

      return res.json(
        requests
      );
    } catch (error) {
      return res
        .status(500)
        .json({
          message:
            "Server error",
        });
    }
  };






  export const getSentRequests =
  async (
    req: any,
    res: Response
  ) => {
    try {
      const requests =
        await MatchRequest.find({
          from: req.user._id,
        })
          .populate(
            "to",
            "name bio"
          )
          .populate(
            "teachSkill"
          )
          .populate(
            "learnSkill"
          );

      return res.json(
        requests
      );
    } catch (error) {
      return res
        .status(500)
        .json({
          message:
            "Server error",
        });
    }
  };







  export const acceptMatchRequest =
  async (
    req: any,
    res: Response
  ) => {
    try {
      const {
        requestId,
      } = req.body;

      const request =
        await MatchRequest.findById(
          requestId
        );

      if (!request) {
        return res
          .status(404)
          .json({
            message:
              "Request not found",
          });
      }

      if (
        request.status !==
        "pending"
      ) {
        return res
          .status(400)
          .json({
            message:
              "Request already processed",
          });
      }

      const senderActive =
        await Match.countDocuments(
          {
            status: "active",
            $or: [
              {
                learner:
                  request.from,
              },
              {
                teacher:
                  request.from,
              },
            ],
          }
        );

      const receiverActive =
        await Match.countDocuments(
          {
            status: "active",
            $or: [
              {
                learner:
                  request.to,
              },
              {
                teacher:
                  request.to,
              },
            ],
          }
        );

      if (
        senderActive >= 5 ||
        receiverActive >= 5
      ) {
        return res
          .status(400)
          .json({
            message:
              "Match limit reached",
          });
      }

      const match =
        await Match.create({
          learner:
            request.from,

          teacher:
            request.to,

          learningSkill:
            request.learnSkill,

          teachingSkill:
            request.teachSkill,
        });

      request.status =
        "accepted";

      await request.save();

      return res.json({
        message:
          "Request accepted",

        match,
      });
    } catch (error) {
      console.error(error);

      return res
        .status(500)
        .json({
          message:
            "Server error",
        });
    }
  };







  export const rejectMatchRequest =
  async (
    req: any,
    res: Response
  ) => {
    try {
      const {
        requestId,
      } = req.body;

      const request =
        await MatchRequest.findById(
          requestId
        );

      if (!request) {
        return res
          .status(404)
          .json({
            message:
              "Request not found",
          });
      }

      request.status =
        "rejected";

      await request.save();

      return res.json({
        message:
          "Request rejected",
        });
    } catch (error) {
      return res
        .status(500)
        .json({
          message:
            "Server error",
        });
    }
  };






  export const getActiveMatches =
  async (
    req: any,
    res: Response
  ) => {
    try {
      const matches =
        await Match.find({
          status: "active",

          $or: [
            {
              learner:
                req.user._id,
            },

            {
              teacher:
                req.user._id,
            },
          ],
        })
          .populate(
            "learner",
            "name email"
          )
          .populate(
            "teacher",
            "name email"
          )
          .populate(
            "learningSkill"
          )
          .populate(
            "teachingSkill"
          );

      return res.json(
        matches
      );
    } catch (error) {
      return res
        .status(500)
        .json({
          message:
            "Server error",
        });
    }
  };







export const completeMatch = async (
  req: any,
  res: Response
) => {
  try {
    const { matchId } = req.body;

    const match =
      await Match.findById(matchId);

    if (!match) {
      return res.status(404).json({
        message: "Match not found",
      });
    }

    if (match.status === "completed") {
      return res.status(400).json({
        message:
          "Match already completed",
      });
    }

    const learner =
      await User.findById(
        match.learner
      );

    const teacher =
      await User.findById(
        match.teacher
      );

    if (!learner || !teacher) {
      return res.status(404).json({
        message:
          "User not found",
      });
    }

    const learningSkillData =
      teacher.skillsOffered.find(
        (s: any) =>
          s.skill.toString() ===
          match.learningSkill.toString()
      );

    const teachingSkillData =
      learner.skillsOffered.find(
        (s: any) =>
          s.skill.toString() ===
          match.teachingSkill.toString()
      );

    if (
      !learningSkillData ||
      !teachingSkillData
    ) {
      return res.status(400).json({
        message:
          "Skill pricing not found",
      });
    }

    const learningCost =
      learningSkillData.tokenCost;

    const teachingCost =
      teachingSkillData.tokenCost;

    const learnerNet =
      teachingCost -
      learningCost;

    const teacherNet =
      learningCost -
      teachingCost;

    learner.tokens +=
      learnerNet;

    teacher.tokens +=
      teacherNet;

      await Transaction.create({
  user: learner._id,
  match: match._id,
  description: `Learned Skill`,
  amount: learningCost,
  type: "spend",
});

await Transaction.create({
  user: learner._id,
  match: match._id,
  description: `Taught Skill`,
  amount: teachingCost,
  type: "earn",
});

await Transaction.create({
  user: teacher._id,
  match: match._id,
  description: `Learned Skill`,
  amount: teachingCost,
  type: "spend",
});

await Transaction.create({
  user: teacher._id,
  match: match._id,
  description: `Taught Skill`,
  amount: learningCost,
  type: "earn",
});

    await learner.save();

    await teacher.save();

    match.tokensTransferred =
      Math.abs(
        learningCost -
          teachingCost
      );

    match.status =
      "completed";

    match.endedAt =
      new Date();

    match.chatEnabled =
      false;

    await match.save();

    learner.completedSessions += 1;

    teacher.completedSessions += 1;

    await learner.save();

    await teacher.save();

    return res.json({
      message:
        "Match completed",

      tokenTransfer:
        match.tokensTransferred,

      learnerTokens:
        learner.tokens,

      teacherTokens:
        teacher.tokens,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Server error",
    });
  }
};






  export const getRecommendedMatches =
  async (
    req: any,
    res: Response
  ) => {
    try {
      const currentUser =
        await User.findById(
          req.user._id
        );

      if (!currentUser) {
        return res
          .status(404)
          .json({
            message:
              "User not found",
          });
      }

      const users =
        await User.find({
          _id: {
            $ne: currentUser._id,
          },
        });

      const recommendations =
        users.map(user => {
          const result =
            calculateMatchScore(
              currentUser,
              user
            );

          return {
            user,
            matchScore:
              result.score,
            reasons:
              result.reasons,
          };
        });

      recommendations.sort(
        (a, b) =>
          b.matchScore -
          a.matchScore
      );

      return res.json(
        recommendations
      );
    } catch (error) {
      console.error(error);

      return res
        .status(500)
        .json({
          message:
            "Server error",
        });
    }
  };



  
export const getMatchHistory = async (
  req: any,
  res: Response
) => {
  try {
    const matches = await Match.find({
      status: "completed",

      $or: [
        {
          learner: req.user._id,
        },
        {
          teacher: req.user._id,
        },
      ],
    })
      .populate(
        "learner",
        "name email"
      )
      .populate(
        "teacher",
        "name email"
      )
      .populate(
        "learningSkill",
        "name category"
      )
      .populate(
        "teachingSkill",
        "name category"
      )
      .sort({
        endedAt: -1,
      });

    return res.json(matches);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};