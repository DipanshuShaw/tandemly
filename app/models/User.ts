import mongoose, { Schema, Document } from "mongoose";

export interface ISkillOffered {
  skill: string;
  tokenCost: number;
  proficiency: string;
}

export interface ISkillWanted {
  skill: string;
  priority: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;

  number: string;
  bio: string;
  profilePicture: string;
  address: string;

  languages: string[];

  tokens: number;

  rating: number;
  completedSessions: number;
  reliabilityScore: number;

  skillsOffered: ISkillOffered[];
  skillsWanted: ISkillWanted[];

  activeLearning: string[];
  activeTeaching: string[];

  createdAt: Date;
  updatedAt: Date;
}

const SkillOfferedSchema = new Schema(
  {
    skill: {
      type: String,
      required: true,
    },

    tokenCost: {
      type: Number,
      default: 10,
    },

    proficiency: {
      type: String,
      default: "Intermediate",
    },
  },
  { _id: true }
);

const SkillWantedSchema = new Schema(
  {
    skill: {
      type: String,
      required: true,
    },

    priority: {
      type: String,
      default: "Medium",
    },
  },
  { _id: true }
);

const UserSchema = new Schema<IUser>(
  {
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
      minlength: 6,
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

    tokens: {
      type: Number,
      default: 100,
    },

    rating: {
      type: Number,
      default: 0,
    },

    completedSessions: {
      type: Number,
      default: 0,
    },

    reliabilityScore: {
      type: Number,
      default: 100,
    },

    skillsOffered: {
      type: [SkillOfferedSchema],
      default: [],
    },

    skillsWanted: {
      type: [SkillWantedSchema],
      default: [],
    },

    activeLearning: {
      type: [String],
      default: [],
    },

    activeTeaching: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);