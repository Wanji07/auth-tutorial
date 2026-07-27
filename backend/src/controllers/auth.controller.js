import { User } from "../models/user.model.js"
import bcryptjs from 'bcryptjs'
import { generateVerificationToken } from "../utils/generateVerificationToken.js"
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js"

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

export const login = async (req, res) => {
    res.send("login route")
}

export const logout = async (req, res) => {
    res.send("logout route")
}