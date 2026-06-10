import mongoose, { Document, Schema } from "mongoose";

export interface IMessage extends Document {
  match: mongoose.Types.ObjectId;

  sender: mongoose.Types.ObjectId;

  content: string;

  messageType:
    | "text"
    | "system";

  isRead: boolean;

  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    match: {
      type: Schema.Types.ObjectId,
      ref: "Match",
      required: true,
    },

    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    messageType: {
      type: String,
      enum: [
        "text",
        "system",
      ],
      default: "text",
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IMessage>(
  "Message",
  MessageSchema
);