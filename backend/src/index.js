import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import path from "path"

dotenv.config()

const app = express()


app.use((req, res, next) => {
    console.log(`The request method is: ${req.method}, and the url is: ${req.url}`)
    next()
})



app.use(express.json())