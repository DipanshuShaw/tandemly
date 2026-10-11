import dotenv from "dotenv";

dotenv.config();

import http from "http";
import app from "./app";
import connectDB from "./config/db";
import { initSocket } from "./socket";

const PORT =
  process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const httpServer = http.createServer(app);

    const io = initSocket(httpServer);

    // Let route controllers emit real-time events (e.g. new match
    // requests, accept/reject updates) via req.app.get("io").
    app.set("io", io);

    httpServer.listen(PORT, () => {
      console.log(
        `Server running on port ${PORT}`
      );
      console.log(
        `Socket.IO chat listening on the same port`
      );
    });
  } catch (error) {
    console.error(error);
  }
};

startServer();