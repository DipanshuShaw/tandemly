import { Request, Response } from "express";
import User from "../models/User";

// Get user profile
export const getUserProfile = async (req: any, res: Response) => {
  try {
    if (!req.user) return res.status(404).json({ message: "User not found" });

    // Exclude password
    const user = await User.findById(req.user.id).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user profile
export const updateUserProfile = async (req: any, res: Response) => {
  try {
    if (!req.user) return res.status(404).json({ message: "User not found" });

    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Update fields if provided in request body
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.number = req.body.number || user.number;
    user.bio = req.body.bio || user.bio;
    user.languages = req.body.languages || user.languages;

    const updatedUser = await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        number: updatedUser.number,
        bio: updatedUser.bio,
        languages: updatedUser.languages,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// GET /api/user/current-match
export const getCurrentMatch = async (req: any, res: Response) => {
  try {
    // 1️⃣ Ensure the logged-in user exists
    const currentUser = req.user;
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    // 2️⃣ Check if user has a current match email
    const matchEmail = currentUser.currentMatchEmail; // <-- make sure this field exists in User model
    if (!matchEmail) return res.json({ message: "No current match", match: null });

    // 3️⃣ Fetch the matched user data
    const matchedUser = await User.findOne({ email: matchEmail }).select("-password");
    if (!matchedUser) return res.status(404).json({ message: "Matched user not found" });

    // 4️⃣ Return the matched user data
    res.json({ user: matchedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};



export const getUserSkills = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.id).select("skills");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ skills: user.skills || [] });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateUserSkills = async (req: any, res: Response) => {
  try {
    const { skills } = req.body;

    // Check if skills is an object
    if (typeof skills !== "object" || skills === null) {
      return res.status(400).json({ message: "Skills must be an object" });
    }

    // Convert object to Map for MongoDB
    const skillsMap = new Map(Object.entries(skills));

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { skills: skillsMap },
      { new: true }
    ).select("skills");

    res.json({ message: "Skills updated successfully", skills: Object.fromEntries(user.skills) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// export const getAllUsers = async (req: Request, res: Response) => {
//   try {
//     const users = await User.find().select("name email bio languages skills tokens isOnline");
//     res.json(users);
//   } catch (error) {
//     res.status(500).json({ message: "Failed to fetch users" });
//   }
// };


export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user?.id; // assuming req.user is set after authentication

    const users = await User.find({ _id: { $ne: currentUserId } }) // exclude current user
      .select("name email bio languages skills tokens isOnline");

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};




export const getUserWallet = async (req: any, res: Response) => {
  try {
    const userId = req.user.id; // assume JWT middleware sets req.user

    const user = await User.findById(userId).select("tokens transactions");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      tokens: user.tokens,
      transactions: user.transactions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};