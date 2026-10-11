import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";

import User from "../models/User";

import generateToken from "../utils/generateToken";

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

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

    user.password = undefined as any;

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

    user.password = undefined as any;

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
   GOOGLE SIGN-IN
   Verifies the ID token Google's Identity
   Services library hands back to the client,
   then finds or creates the matching user.
===================================== */

export const googleAuth = async (
  req: Request,
  res: Response
) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Missing Google credential",
      });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({
        message:
          "Google sign-in isn't configured on the server yet",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email) {
      return res.status(400).json({
        message: "Invalid Google credential",
      });
    }

    let user = await User.findOne({
      googleId: payload.sub,
    });

    if (!user) {
      user = await User.findOne({
        email: payload.email,
      });

      if (user) {
        // An account with this email already exists locally —
        // link the Google identity to it instead of duplicating.
        user.googleId = payload.sub;

        if (!user.profilePicture && payload.picture) {
          user.profilePicture = payload.picture;
        }

        await user.save();
      } else {
        const randomPassword = crypto
          .randomBytes(32)
          .toString("hex");

        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(
          randomPassword,
          salt
        );

        user = await User.create({
          name:
            payload.name ||
            payload.email.split("@")[0],

          email: payload.email,

          password: hashedPassword,

          profilePicture: payload.picture || "",

          googleId: payload.sub,

          authProvider: "google",

          tokens: 100,

          languages: [],

          skillsOffered: [],

          skillsWanted: [],
        });
      }
    }

    user.password = undefined as any;

    return res.status(200).json({
      message: "Google sign-in successful",

      token: generateToken(user._id.toString()),

      user,
    });
  } catch (error) {
    console.error("Google Auth Error:", error);

    return res.status(401).json({
      message: "Google sign-in failed",
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