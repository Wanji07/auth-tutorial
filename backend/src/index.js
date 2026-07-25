import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import path from "path"

import { connectDB } from "./config/db.js"
import authRoutes from "./routes/auth.route.js"

dotenv.config();

const app = express()
const PORT = process.env.PORT || 5000

app.use((req, res, next) => {
    console.log(`The request method is: ${req.method}, and the url is: ${req.url}`)
    next()
})

app.use(express.json())

app.use("/api/auth", authRoutes)


connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port: ${PORT}`)
    })
})