import express from "express";

import {
  getMessages,
  getConversations,
} from "../controllers/messageController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// NOTE: /conversations must be registered before /:matchId
// so it isn't swallowed by the param route.
router.get(
  "/conversations",
  protect,
  getConversations
);

router.get(
  "/:matchId",
  protect,
  getMessages
);

export default router;
