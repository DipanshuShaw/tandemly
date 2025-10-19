import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  number: string;
  skills: string[]; // what they can teach
  role: "teacher" | "student" | "both";
  bio?: string;
  password: string;
  createdAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    number: { type: String, required: true },
    skills: { type: [String], required: true },
    role: {
      type: String,
      enum: ["teacher", "student", "both"],
      default: "student",
    },
    bio: { type: String },
    password: { type: String, required: true, minlength: 6 },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
