import express from 'express';
import dotenv from "dotenv";
import { connectDB } from './src/config/db.js';
import authRoutes from "./src/routes/authRoutes.js";

//congifures the env to grab variables
dotenv.config()

const PORT = process.env.PORT || 5001;

//the express application
const app  = express();

 //lets us receive json data in the req.body (otherwise undefined)
app.use(express.json());

//all the routes from authRoutes
app.user("/api/auth", authRoutes) 

connectDB();    //connects and starts the mongoDB

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
