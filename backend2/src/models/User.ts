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

  assessmentStatus?: "not_assessed" | "assessed" | "failed";

  assessmentScore?: number;

  lastAssessmentId?: mongoose.Types.ObjectId;

  lastAssessedAt?: Date;
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

  googleId?: string;

  authProvider: "local" | "google";

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

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
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

        assessmentStatus: {
          type: String,
          enum: ["not_assessed", "assessed", "failed"],
          default: "not_assessed",
        },

        assessmentScore: {
          type: Number,
          default: null,
        },

        lastAssessmentId: {
          type: Schema.Types.ObjectId,
          ref: "Assessment",
          default: null,
        },

        lastAssessedAt: {
          type: Date,
          default: null,
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

// Browse Skills looks up "who offers this skill" — index the
// array field it filters on.
UserSchema.index({ "skillsOffered.skill": 1 });