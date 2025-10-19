import express from "express"
import { protect } from "../middleware/authMiddleware"

const router = express.Router()

// Protected route: Get logged-in user info
router.get("/me", protect, (req, res) => {
  // @ts-ignore
  res.status(200).json(req.user)
})

export default router
    