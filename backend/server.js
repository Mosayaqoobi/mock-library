import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import bookRoutes from "./src/routes/bookRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import borrowRoutes from "./src/routes/borrowRoutes.js";

//congifures the env to grab variables
dotenv.config()

const PORT = process.env.PORT || 5001;

//the express application
const app  = express();

 //lets us receive json data in the req.body (otherwise undefined)
app.use(express.json());

//all the routes from authRoutes
app.use("/api/auth", authRoutes);
//all book routes from bookroutes
app.use("/api/books", bookRoutes);
//all user routes from userroutes
app.use("/api/users", userRoutes);
//all borrow routes from borrowroutes
app.use("/api/borrow", borrowRoutes);

//dont connect to db if we are testing (tests connect to mock db)
if (process.env.NODE_ENV !== "test") {
    //connects and starts the mongoDB
    connectDB();

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    }); 
}  

export default app;
