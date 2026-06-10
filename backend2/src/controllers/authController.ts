import { Request, Response } from "express";
import bcrypt from "bcryptjs";

import User from "../models/User";

import generateToken from "../utils/generateToken";

/* =====================================
   REGISTER
===================================== */

export const register = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    if (
      !name ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        message:
          "Name, email and password are required",
      });
    }

    const existingUser =
      await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message:
          "User already exists",
      });
    }

    const salt =
      await bcrypt.genSalt(10);

    const hashedPassword =
      await bcrypt.hash(
        password,
        salt
      );

    const user =
      await User.create({
        name,

        email,

        password:
          hashedPassword,

        tokens: 100,

        languages: [],

        skillsOffered: [],

        skillsWanted: [],
      });

    return res.status(201).json({
      message:
        "Registration successful",

      token:
        generateToken(
          user._id.toString()
        ),

      user,
    });
  } catch (error) {
    console.error(
      "Register Error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error",
    });
  }
};

/* =====================================
   LOGIN
===================================== */

export const login = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      email,
      password,
    } = req.body;

const user = await User.findOne({
  email,
}).select("+password");

    if (!user) {
      return res.status(400).json({
        message:
          "Invalid credentials",
      });
    }

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {
      return res.status(400).json({
        message:
          "Invalid credentials",
      });
    }

    return res.status(200).json({
      message:
        "Login successful",

      token:
        generateToken(
          user._id.toString()
        ),

      user,
    });
  } catch (error) {
    console.error(
      "Login Error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error",
    });
  }
};

/* =====================================
   CURRENT USER
===================================== */

export const getMe = async (
  req: any,
  res: Response
) => {
  try {
    const user =
      await User.findById(
        req.user._id
      )
        .select("-password")
        .populate(
          "skillsOffered.skill"
        )
        .populate(
          "skillsWanted.skill"
        );

    if (!user) {
      return res.status(404).json({
        message:
          "User not found",
      });
    }

    return res.status(200).json(
      user
    );
  } catch (error) {
    console.error(
      "Get Me Error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error",
    });
  }
};