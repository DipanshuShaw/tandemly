import { Request, Response } from "express";
import Skill from "../models/Skill";

/* =========================================
   GET ALL SKILLS
========================================= */

export const getSkills = async (
  req: Request,
  res: Response
) => {
  try {
    const skills = await Skill.find({
      isActive: true,
    }).sort({ name: 1 });

    return res.status(200).json(skills);
  } catch (error) {
    console.error("Get Skills Error:", error);

    return res.status(500).json({
      message: "Failed to fetch skills",
    });
  }
};

/* =========================================
   GET SKILL BY ID
========================================= */

export const getSkillById = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const skill = await Skill.findById(id);

    if (!skill) {
      return res.status(404).json({
        message: "Skill not found",
      });
    }

    return res.status(200).json(skill);
  } catch (error) {
    console.error("Get Skill Error:", error);

    return res.status(500).json({
      message: "Failed to fetch skill",
    });
  }
};

/* =========================================
   CREATE SKILL
========================================= */

export const createSkill = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      name,
      category,
      aliases,
      description,
    } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        message: "Name and category are required",
      });
    }

    const existingSkill = await Skill.findOne({
      name: {
        $regex: new RegExp(`^${name}$`, "i"),
      },
    });

    if (existingSkill) {
      return res.status(400).json({
        message: "Skill already exists",
      });
    }

    const skill = await Skill.create({
      name,
      category,
      aliases: aliases || [],
      description: description || "",
    });

    return res.status(201).json({
      message: "Skill created successfully",
      skill,
    });
  } catch (error) {
    console.error("Create Skill Error:", error);

    return res.status(500).json({
      message: "Failed to create skill",
    });
  }
};

/* =========================================
   SEARCH SKILLS
========================================= */

export const searchSkills = async (
  req: Request,
  res: Response
) => {
  try {
    const query = req.query.q as string;

    if (!query) {
      return res.status(200).json([]);
    }

    const skills = await Skill.find({
      isActive: true,
      $or: [
        {
          name: {
            $regex: query,
            $options: "i",
          },
        },
        {
          aliases: {
            $elemMatch: {
              $regex: query,
              $options: "i",
            },
          },
        },
      ],
    })
      .limit(10)
      .sort({ name: 1 });

    return res.status(200).json(skills);
  } catch (error) {
    console.error("Search Skill Error:", error);

    return res.status(500).json({
      message: "Failed to search skills",
    });
  }
};

/* =========================================
   UPDATE SKILL
========================================= */

export const updateSkill = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const skill = await Skill.findById(id);

    if (!skill) {
      return res.status(404).json({
        message: "Skill not found",
      });
    }

    skill.name = req.body.name || skill.name;
    skill.category =
      req.body.category || skill.category;

    skill.aliases =
      req.body.aliases || skill.aliases;

    skill.description =
      req.body.description ||
      skill.description;

    await skill.save();

    return res.status(200).json({
      message: "Skill updated successfully",
      skill,
    });
  } catch (error) {
    console.error("Update Skill Error:", error);

    return res.status(500).json({
      message: "Failed to update skill",
    });
  }
};

/* =========================================
   DELETE SKILL (SOFT DELETE)
========================================= */

export const deleteSkill = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const skill = await Skill.findById(id);

    if (!skill) {
      return res.status(404).json({
        message: "Skill not found",
      });
    }

    skill.isActive = false;

    await skill.save();

    return res.status(200).json({
      message: "Skill deleted successfully",
    });
  } catch (error) {
    console.error("Delete Skill Error:", error);

    return res.status(500).json({
      message: "Failed to delete skill",
    });
  }
};