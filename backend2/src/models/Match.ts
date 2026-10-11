import mongoose, { Document, Schema } from "mongoose";

export interface IMatch extends Document {
  learner: mongoose.Types.ObjectId;

  teacher: mongoose.Types.ObjectId;

  learningSkill: mongoose.Types.ObjectId;

  teachingSkill: mongoose.Types.ObjectId;

  status:
    | "active"
    | "completed"
    | "cancelled";

  startedAt: Date;

  endedAt?: Date;

  tokensTransferred: number;

  chatEnabled: boolean;

  learnerRated: boolean;

  teacherRated: boolean;
}

const MatchSchema = new Schema<IMatch>(
  {
    learner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    teacher: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    learningSkill: {
      type: Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
    },

    teachingSkill: {
      type: Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
    },

    status: {
      type: String,

      enum: [
        "active",
        "completed",
        "cancelled",
      ],

      default: "active",
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    endedAt: {
      type: Date,
    },

    tokensTransferred: {
      type: Number,
      default: 0,
    },

    chatEnabled: {
      type: Boolean,
      default: true,
    },

    learnerRated: {
      type: Boolean,
      default: false,
    },

    teacherRated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IMatch>(
  "Match",
  MatchSchema
);

// Every match lookup filters by learner/teacher (often together via
// $or) and usually also by status — without these, MongoDB falls
// back to a full collection scan that gets slower as matches grow.
MatchSchema.index({ learner: 1, status: 1 });
MatchSchema.index({ teacher: 1, status: 1 });