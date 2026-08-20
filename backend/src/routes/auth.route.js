import express from "express"

const router = express.Router()

import { login, signup, logout, verifyEmail, forgotPassword } from "../controllers/auth.controller.js"

// Routes for Authentication
router.post("/signup", signup)
router.post("/login", login)
router.post("/logout", logout)

router.post("/verify-email", verifyEmail)
router.post("/forgot-password", forgotPassword)

export default router