import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes";
import skillRoutes from "./routes/skillRoutes";
import matchRoutes from "./routes/matchRoutes";
import reviewRoutes from "./routes/reviewRoutes";


import userRoutes from "./routes/userRoutes";

const app = express();

/* ==========================
   MIDDLEWARE
========================== */

app.use(cors());

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

export default app;