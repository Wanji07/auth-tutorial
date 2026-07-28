import express from "express"

const router = express.Router()

import { login, signup, logout, verifyEmail } from "../controllers/auth.controller.js"

// Routes for Authentication
router.post("/signup", signup)
router.post("/login", login)
router.post("/logout", logout)

router.post("/verify-email", verifyEmail)

export default router