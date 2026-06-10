import mongoose, {
  Document,
  Schema,
} from "mongoose";

export interface ITransaction
  extends Document {
  user: mongoose.Types.ObjectId;

  match?: mongoose.Types.ObjectId;

  description: string;

  amount: number;

  type: "earn" | "spend";

  createdAt: Date;

  updatedAt: Date;
}

const TransactionSchema =
  new Schema<ITransaction>(
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      match: {
        type: Schema.Types.ObjectId,
        ref: "Match",
      },

      description: {
        type: String,
        required: true,
        trim: true,
      },

      amount: {
        type: Number,
        required: true,
        min: 0,
      },

      type: {
        type: String,
        enum: [
          "earn",
          "spend",
        ],
        required: true,
      },
    },
    {
      timestamps: true,
    }
  );

const Transaction =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>(
    "Transaction",
    TransactionSchema
  );

export default Transaction;