import mongoose from "mongoose"

export const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDB Connected successfully!`)
    } catch (error) {
        console.log("Error connection to MongoDB: ", error)
        process.exit(1) // exit w/failure
    }
}