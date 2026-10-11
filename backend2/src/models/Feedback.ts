import mongoose, { Document, Schema } from "mongoose";

export interface IFeedback extends Document {
  name: string;
  email: string;
  rating: number;
  message: string;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IFeedback>(
  "Feedback",
  FeedbackSchema
);
