import { User } from "../models/user.model.js"
import bcryptjs from 'bcryptjs'
import crypto from "crypto"
import dotenv from "dotenv"
import { generateVerificationToken } from "../utils/generateVerificationToken.js"
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js"
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } from "../mailtrap/emails.js"

dotenv.config()

export const signup = async (req, res) => {
    const {email, name, password} = req.body
    try {
        if (!email || !password || !name) {
            throw new Error("All fields are required!")
        }

        const userAlreadyExists = await User.findOne({email})
        if (userAlreadyExists) {
            return res.status(400).json({success: false, message: "User already exists"})
        }

        const hashedPassword = await bcryptjs.hash(password, 10)
        // Hash the password before storing it in the database

        const verificationToken = generateVerificationToken()

        const user = new User({
            email, 
            name, 
            password: hashedPassword,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        })

        await user.save()

        // JWT

        generateTokenAndSetCookie(res, user._id)

        await sendVerificationEmail(user.email, verificationToken)

        res.status(201).json({
            success: true,
            message: "User created successfully!",
            user: {
                ...user._doc,
                password: undefined,
            }
        })

    } catch (error) {
        res.status(400).json({success: false, message: error.message})
    }
}

export const verifyEmail = async (req, res) => {
    const { code } = req.body
    try {
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() }
        })

        if (!user) {
            return res.status(400).json({success: false, message: "Invalid or expired verification code"})
        }

        user.isVerified = true
        user.verificationToken = undefined
        user.verificationTokenExpiresAt = undefined
        await user.save()

        await sendWelcomeEmail(user.email, user.name);

        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user: {
                ...user._doc,
                password: undefined,
            }, 
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
}

export const login = async (req, res) => {  
    try {
        const { email, password } = req.body
        try {
            const user = await User.findOne({ email })

            if (!user) {
                return res.status(400).json({ success: false, message: " Invalid credentials"})
            }

            const isPasswordValid = await bcryptjs.compare(password, user.password);

            if (!isPasswordValid) {
                return res.status(400).json({ success: false, message: " Invalid credentials"})
            }

            generateTokenAndSetCookie(res, user._id)

            user.lastlogin = new Date();

            await user.save()

            res.status(200).json({
                success: true,
                message: "Logged in successfully",
                user: {
                    ...user._doc,
                    password:undefined,
                }
            })

        } catch (error) {
            console.log("Error in login",)
        }

    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
}

export const logout = async (req, res) => {
    res.clearCookie("token")
    res.status(200).json({success: true, message: "Logged out successfully!"})
}

export const forgotPassword = async (req, res) => {
    const { email } = req.body
    
    try {
        const user = await User.findOne({ email })

        if (!user) {
            res.status(400).json({success: false, message: "User not found!"})
        }

        // Generate Reset Token

        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

        user.resetPasswordToken = resetToken
        user.resetPasswordExpiresAt = resetTokenExpiresAt

        // Send Email

        await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`)

    } catch (error) {
        console.log("Error in forgot password", error)
        res.status(400).json({success: false, message: error.message})
    }
}