import express from "express";
import { getBookById, searchBooks } from "../controllers/bookController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();


//can search for books using title, author, genre
router.get("/search", protect, searchBooks);
//get details of a book
router.get("/:id", protect, getBookById);


export default router;