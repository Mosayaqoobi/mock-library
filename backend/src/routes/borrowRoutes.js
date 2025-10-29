// file for the borrow routes
// allows authenticated users to borrow books,
// return books,
// or renew them

import express from "express";
import { protect } from "../middleware/auth.js";
import { borrowABook, returnABook, getAllBorrowedBooksByUser, renewABook } from "../controllers/borrowController.js";


const router = express.Router();

//get the books being borrowed currently
router.get("/", protect, getAllBorrowedBooksByUser);
//borrow a book
router.post("/", protect, borrowABook);
//return a book
router.post("/return", protect, returnABook);
//renew a book
router.post("/renew", protect, renewABook);

export default router;
