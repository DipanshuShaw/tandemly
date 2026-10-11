import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes";
import skillRoutes from "./routes/skillRoutes";
import matchRoutes from "./routes/matchRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import messageRoutes from "./routes/messageRoutes";
import sessionRoutes from "./routes/sessionRoutes";
import feedbackRoutes from "./routes/feedbackRoutes";
import assessmentRoutes from "./routes/assessmentRoutes";


import userRoutes from "./routes/userRoutes";

const app = express();

/* ==========================
   MIDDLEWARE
========================== */


app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://tandemlylearn.vercel.app",
    ],
    credentials: true,
  })
);
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

/* ==========================
   ROUTES
========================== */

app.get("/", (req, res) => {
  res.json({
    message: "Tandemly Backend V2 Running",
  });
});


app.use(
  "/api/users",
  userRoutes
);

app.use(
  "/api/reviews",
  reviewRoutes
);

app.use("/api/auth", authRoutes);

app.use("/api/skills", skillRoutes);

app.use("/api/matches", matchRoutes);

app.use("/api/messages", messageRoutes);

app.use("/api/sessions", sessionRoutes);

app.use("/api/feedback", feedbackRoutes);

app.use("/api/assessments", assessmentRoutes);

export default app;