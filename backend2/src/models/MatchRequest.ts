import mongoose, { Document, Schema } from "mongoose";

export interface IMatchRequest extends Document {
  from: mongoose.Types.ObjectId;

  to: mongoose.Types.ObjectId;

  teachSkill: mongoose.Types.ObjectId;

  learnSkill: mongoose.Types.ObjectId;

  status:
    | "pending"
    | "accepted"
    | "rejected";

  message?: string;

  createdAt: Date;
}

const MatchRequestSchema =
  new Schema<IMatchRequest>(
    {
      from: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      to: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      teachSkill: {
        type: Schema.Types.ObjectId,
        ref: "Skill",
        required: true,
      },

      learnSkill: {
        type: Schema.Types.ObjectId,
        ref: "Skill",
        required: true,
      },

      status: {
        type: String,

        enum: [
          "pending",
          "accepted",
          "rejected",
        ],

        default: "pending",
      },

      message: {
        type: String,
        default: "",
      },
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model<IMatchRequest>(
  "MatchRequest",
  MatchRequestSchema
);