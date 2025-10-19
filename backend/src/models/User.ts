import mongoose from "mongoose";
import { Document, Schema } from "mongoose";
// Transaction interface
interface Transaction {
  id: number; // unique id per transaction
  description: string;
  amount: number;
  type: "earn" | "spend" | "purchase";
  date: string; // you can also use Date if preferred
}

// Define the shape of a user document
export interface IUser extends Document {
  name: string;
  email: string;
  number: string;
  password: string;
  languages: string[];
  address: string;
  skills: { [key: string]: number }; // skill: token value
  tokens: number;
  bio: string;
  currentMatch?: mongoose.Types.ObjectId | null;
  matchHistory: mongoose.Types.ObjectId[];
  transactions: Transaction[];
}

const TransactionSchema = new Schema<Transaction>({
  id: { type: Number, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ["earn", "spend", "purchase"], required: true },
  date: { type: String, required: true },
});

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    number: { type: String, required: true },
    password: { type: String, required: true },
    languages: [{ type: String, required: true }],
    address: { type: String, required: true },
    skills: {
      type: Map,
      of: Number, // skill: tokenValue pairs
      default: {},
    },
    tokens: { type: Number, default: 100 }, // initial trial tokens
    bio: { type: String },
    currentMatch: { type: String, ref: "User", default: null },
    matchHistory: [{ type: Schema.Types.ObjectId, ref: "User" }],
    transactions: { type: [TransactionSchema], default: [] }, // added transactions
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", userSchema);
export default User;
