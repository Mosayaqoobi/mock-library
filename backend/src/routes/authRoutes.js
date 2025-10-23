import express from "express";
import { protect } from "../middleware/auth.js";
import jwt from "jsonwebtoken";
import { login, register, me } from "../controllers/authController.js";

const router = express.Router();    

// route for users to register
router.post("/register", register);
// route for users to log in
router.post("/login", login);
// route to get the details of the current user, using protected => (with the password)
router.get("/me", protect, me);


export default router;