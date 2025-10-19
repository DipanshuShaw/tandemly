import mongoose from "mongoose";
import User from "./src/models/User";

const initializeTokens = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/tandemlyTest");
    console.log("Connected to MongoDB");

    const users = await User.find();

    for (const user of users) {
      // Set tokens to 100 if not set
      if (!user.tokens || user.tokens < 100) user.tokens = 100;

      // Add initial transaction if not already present
      const initialTransactionExists = user.transactions.some(
        (t) => t.description === "Initial tokens"
      );

      if (!initialTransactionExists) {
        user.transactions.push({
          id: new Date().getTime(), // unique id
          description: "Initial tokens",
          amount: 100,
          type: "earn",
          date: new Date().toISOString(),
        });
      }

      await user.save();
    }

    console.log("Tokens and initial transactions initialized for all users");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

initializeTokens();
