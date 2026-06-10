import mongoose, {
  Document,
  Schema,
} from "mongoose";

export interface IReview
  extends Document {
  reviewer: mongoose.Types.ObjectId;

  reviewee: mongoose.Types.ObjectId;

  match: mongoose.Types.ObjectId;

  rating: number;

  comment: string;
}

const ReviewSchema =
  new Schema<IReview>(
    {
      reviewer: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      reviewee: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      match: {
        type: Schema.Types.ObjectId,
        ref: "Match",
        required: true,
      },

      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },

      comment: {
        type: String,
        default: "",
      },
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model<IReview>(
  "Review",
  ReviewSchema
);