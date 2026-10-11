import mongoose, { Document, Schema } from "mongoose";

export interface ISkill extends Document {
  name: string;

  category: string;

  aliases: string[];

  description?: string;

  isActive: boolean;
}

const SkillSchema = new Schema<ISkill>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    aliases: {
      type: [String],
      default: [],
    },

    description: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ISkill>(
  "Skill",
  SkillSchema
);