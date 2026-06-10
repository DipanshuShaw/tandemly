import mongoose, { Document, Schema } from "mongoose";

/* =========================================
   SKILLS OFFERED
========================================= */

interface SkillOffered {
  skill: mongoose.Types.ObjectId;

  tokenCost: number;

  proficiency:
    | "Beginner"
    | "Intermediate"
    | "Advanced";
}

/* =========================================
   SKILLS WANTED
========================================= */

interface SkillWanted {
  skill: mongoose.Types.ObjectId;

  priority:
    | "Low"
    | "Medium"
    | "High";
}

/* =========================================
   USER INTERFACE
========================================= */

export interface IUser extends Document {
  name: string;

  email: string;

  password: string;

  number?: string;

  bio?: string;

  profilePicture?: string;

  languages: string[];

  address?: string;

  tokens: number;

  rating: number;

  completedSessions: number;

  reviewCount: number;

  reliabilityScore: number;

  skillsOffered: SkillOffered[];

  skillsWanted: SkillWanted[];

  activeLearning: mongoose.Types.ObjectId[];

  activeTeaching: mongoose.Types.ObjectId[];
}

/* =========================================
   USER SCHEMA
========================================= */

const UserSchema = new Schema<IUser>(
  {
    /* ---------------------------
       BASIC INFO
    ---------------------------- */

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
        select: false,
    },

    number: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
    },

    profilePicture: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    languages: {
      type: [String],
      default: [],
    },

    /* ---------------------------
       TOKEN ECONOMY
    ---------------------------- */

    tokens: {
      type: Number,
      default: 100,
    },

    /* ---------------------------
       REPUTATION
    ---------------------------- */

    rating: {
      type: Number,
      default: 0,
    },

    completedSessions: {
      type: Number,
      default: 0,
    },
    reviewCount: {
  type: Number,
  default: 0,
},

    reliabilityScore: {
      type: Number,
      default: 100,
    },

    /* ---------------------------
       SKILLS OFFERED
    ---------------------------- */

    skillsOffered: [
      {
        skill: {
          type: Schema.Types.ObjectId,
          ref: "Skill",
          required: true,
        },

        tokenCost: {
          type: Number,
          default: 10,
        },

        proficiency: {
          type: String,
          enum: [
            "Beginner",
            "Intermediate",
            "Advanced",
          ],

          default: "Intermediate",
        },
      },
    ],

    /* ---------------------------
       SKILLS WANTED
    ---------------------------- */

    skillsWanted: [
      {
        skill: {
          type: Schema.Types.ObjectId,
          ref: "Skill",
          required: true,
        },

        priority: {
          type: String,

          enum: [
            "Low",
            "Medium",
            "High",
          ],

          default: "Medium",
        },
      },
    ],

    /* ---------------------------
       ACTIVE MATCHES
    ---------------------------- */

    activeLearning: [
      {
        type: Schema.Types.ObjectId,
        ref: "Match",
      },
    ],

    activeTeaching: [
      {
        type: Schema.Types.ObjectId,
        ref: "Match",
      },
    ],
  },

  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>(
  "User",
  UserSchema
);