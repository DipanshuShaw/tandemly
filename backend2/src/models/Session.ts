import mongoose, { Document, Schema } from "mongoose";

export interface ISession extends Document {
  match: mongoose.Types.ObjectId;

  proposedBy: mongoose.Types.ObjectId;

  scheduledTime: Date;

  duration: number; // minutes

  notes?: string;

  status: "proposed" | "confirmed" | "declined" | "cancelled";
}

const SessionSchema = new Schema<ISession>(
  {
    match: {
      type: Schema.Types.ObjectId,
      ref: "Match",
      required: true,
    },

    proposedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    scheduledTime: {
      type: Date,
      required: true,
    },

    duration: {
      type: Number,
      default: 30,
    },

    notes: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["proposed", "confirmed", "declined", "cancelled"],
      default: "proposed",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ISession>("Session", SessionSchema);
