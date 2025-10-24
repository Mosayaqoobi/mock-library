//this connects the mongoDB, and will be called in the server.js to be started

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 5001;


export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB connected ${conn.connection.host}`)
    } catch (error) {
        console.log(error)
        process.exit(1) //stop program with 1 which is error

    }
}