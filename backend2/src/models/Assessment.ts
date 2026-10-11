import mongoose, { Document, Schema } from "mongoose";

/* =========================================
   ASSESSMENT
   One document per attempt. Generated questions
   carry their correct answer server-side only —
   the API layer strips it before a question ever
   reaches the client, until after submission.
========================================= */

export interface IAssessmentQuestion {
  questionText: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface IAssessmentAnswer {
  questionIndex: number;
  selectedIndex: number;
}

export type AssessmentStatus = "in_progress" | "submitted" | "expired";

export interface IAssessment extends Document {
  user: mongoose.Types.ObjectId;
  skill: mongoose.Types.ObjectId;

  proficiencyClaimed: string;
  attemptNumber: number;

  questions: IAssessmentQuestion[];
  answers: IAssessmentAnswer[];

  status: AssessmentStatus;

  totalQuestions: number;
  correctCount: number;
  percentage: number;
  passed: boolean;

  timeLimitSeconds: number;
  startedAt: Date;
  expiresAt: Date;
  submittedAt?: Date;
  timeTakenSeconds?: number;
}

const QuestionSchema = new Schema<IAssessmentQuestion>(
  {
    questionText: { type: String, required: true },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (arr: string[]) => arr.length === 4,
        message: "Each question must have exactly 4 options",
      },
    },
    correctIndex: { type: Number, required: true, min: 0, max: 3 },
    explanation: { type: String, default: "" },
  },
  { _id: false }
);

const AnswerSchema = new Schema<IAssessmentAnswer>(
  {
    questionIndex: { type: Number, required: true },
    selectedIndex: { type: Number, required: true },
  },
  { _id: false }
);

const AssessmentSchema = new Schema<IAssessment>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    skill: { type: Schema.Types.ObjectId, ref: "Skill", required: true },

    proficiencyClaimed: { type: String, required: true },
    attemptNumber: { type: Number, required: true, default: 1 },

    questions: { type: [QuestionSchema], required: true },
    answers: { type: [AnswerSchema], default: [] },

    status: {
      type: String,
      enum: ["in_progress", "submitted", "expired"],
      default: "in_progress",
    },

    totalQuestions: { type: Number, required: true },
    correctCount: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },

    timeLimitSeconds: { type: Number, required: true },
    startedAt: { type: Date, required: true, default: Date.now },
    expiresAt: { type: Date, required: true },
    submittedAt: { type: Date },
    timeTakenSeconds: { type: Number },
  },
  { timestamps: true }
);

AssessmentSchema.index({ user: 1, skill: 1, createdAt: -1 });

export default mongoose.model<IAssessment>("Assessment", AssessmentSchema);
