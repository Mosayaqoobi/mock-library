import express from "express";
import { getBookById, searchBooks } from "../controllers/bookController.js";

const router = express.Router();


//can search for books using title, author, genre
router.get("/search", searchBooks);
//get details of a book
router.get("/:id", getBookById);


export default router;