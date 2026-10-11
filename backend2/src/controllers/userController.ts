import { Request, Response } from "express";
import User from "../models/User";
import Skill from "../models/Skill";

import Transaction from "../models/Transaction";

/* =====================================
   GET PROFILE
===================================== */

export const getProfile = async (
  req: any,
  res: Response
) => {
  try {
    const user = await User.findById(
      req.user._id
    )
      .select("-password")
      .populate("skillsOffered.skill")
      .populate("skillsWanted.skill");

    return res.json(user);
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

/* =====================================
   ADD OFFERED SKILL
===================================== */

export const addOfferedSkill = async (
  req: any,
  res: Response
) => {
  try {
    const {
      skillId,
      tokenCost,
      proficiency,
    } = req.body;

    const skill =
      await Skill.findById(skillId);

    if (!skill) {
      return res.status(404).json({
        message: "Skill not found",
      });
    }

    const user =
      await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Prevent duplicate offered skill
    const alreadyOffered =
      user.skillsOffered.some(
        (s: any) =>
          s.skill.toString() === skillId
      );

    if (alreadyOffered) {
      return res.status(400).json({
        message:
          "Skill already exists in offered skills",
      });
    }

    // Prevent same skill in wanted list
    const existsInWanted =
      user.skillsWanted.some(
        (s: any) =>
          s.skill.toString() === skillId
      );

    if (existsInWanted) {
      return res.status(400).json({
        message:
          "Cannot offer a skill that already exists in wanted skills",
      });
    }

    const alreadyExists =
      user.skillsOffered.some(
        (s: any) =>
          s.skill.toString() === skillId
      );

    if (alreadyExists) {
      return res.status(400).json({
        message:
          "Skill already added to offered skills",
      });
    }

    user.skillsOffered.push({
      skill: skill._id,
      tokenCost:
        tokenCost || 10,
      proficiency:
        proficiency ||
        "Intermediate",
    });

    await user.save();

    return res.json({
      message:
        "Skill added successfully",
      skillsOffered:
        user.skillsOffered,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Server error",
    });
  }
};

/* =====================================
   ADD WANTED SKILL
===================================== */

export const addWantedSkill = async (
  req: any,
  res: Response
) => {
  try {
    const {
      skillId,
      priority,
    } = req.body;

    const skill =
      await Skill.findById(skillId);

    if (!skill) {
      return res.status(404).json({
        message: "Skill not found",
      });
    }

    const user =
      await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }


    // Prevent duplicate wanted skill
    const alreadyWanted =
      user.skillsWanted.some(
        (s: any) =>
          s.skill.toString() === skillId
      );

    if (alreadyWanted) {
      return res.status(400).json({
        message:
          "Skill already exists in wanted skills",
      });
    }

    // Prevent same skill in offered list
    const existsInOffered =
      user.skillsOffered.some(
        (s: any) =>
          s.skill.toString() === skillId
      );

    if (existsInOffered) {
      return res.status(400).json({
        message:
          "Cannot want a skill that already exists in offered skills",
      });
    }

    const alreadyExists =
      user.skillsWanted.some(
        (s: any) =>
          s.skill.toString() === skillId
      );

    if (alreadyExists) {
      return res.status(400).json({
        message:
          "Skill already added to wanted skills",
      });
    }

    user.skillsWanted.push({
      skill: skill._id,
      priority:
        priority ||
        "Medium",
    });

    await user.save();

    return res.json({
      message:
        "Skill added successfully",
      skillsWanted:
        user.skillsWanted,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Server error",
    });
  }
};



export const updateProfile = async (
  req: any,
  res: Response
) => {
  try {
    const {
      bio,
      languages,
      address,
      profilePicture,
      number,
    } = req.body;

    const user =
      await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (bio !== undefined)
      user.bio = bio;

    if (languages !== undefined)
      user.languages = languages;

    if (address !== undefined)
      user.address = address;

    if (profilePicture !== undefined)
      user.profilePicture =
        profilePicture;

    if (number !== undefined)
      user.number = number;

    await user.save();

    return res.json({
      message:
        "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Server error",
    });
  }
};





export const discoverUsers = async (
  req: any,
  res: Response
) => {
  try {
    const users = await User.find({
      _id: {
        $ne: req.user._id,
      },
    })
      .select("-password")
      .populate("skillsOffered.skill")
      .populate("skillsWanted.skill");

    return res.json(users);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};








export const removeOfferedSkill = async (
  req: any,
  res: Response
) => {
  try {
    const { skillId } = req.params;

    const user = await User.findById(
      req.user._id
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.skillsOffered =
      user.skillsOffered.filter(
        (s: any) =>
          s.skill.toString() !== skillId
      );

    await user.save();

    return res.json({
      message:
        "Offered skill removed",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};




export const removeWantedSkill = async (
  req: any,
  res: Response
) => {
  try {
    const { skillId } = req.params;

    const user = await User.findById(
      req.user._id
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.skillsWanted =
      user.skillsWanted.filter(
        (s: any) =>
          s.skill.toString() !== skillId
      );

    await user.save();

    return res.json({
      message:
        "Wanted skill removed",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};




export const getWallet = async (
  req: any,
  res: Response
) => {
  try {
    const user =
      await User.findById(
        req.user._id
      );

    if (!user) {
      return res.status(404).json({
        message:
          "User not found",
      });
    }

const transactions =
  await Transaction.find({
    user: req.user._id,
  }).sort({
    createdAt: -1,
  });

return res.json({
  tokens: user.tokens,

  transactions:
    transactions.map(
      (transaction) => ({
        _id:
          transaction._id,

        description:
          transaction.description,

        amount:
          transaction.amount,

        type:
          transaction.type,

        date:
          new Date(
            transaction.createdAt
          ).toLocaleDateString(),
      })
    ),
});
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Server error",
    });
  }
};