//this file will contain the routes for the users
import express from "express";
import { protect } from "../middleware/auth.js";
import { deleteProfile, updateProfile } from "../controllers/userController.js";

const router = express.Router();

//get the users profile
router.put("/profile", protect, updateProfile)
//update the users' profile
router.delete("/profile", protect, deleteProfile)

export default router;


