// file for the borrow routes
// allows authenticated users to borrow books,
// return books,
// or renew them

import express from "express";
import { protect } from "../middleware/auth.js";


const router = express.router();

//get the books being borrowed currently
router.get("/", protect);
//borrow a book
router.post("/", protect);
//return a book
router.post("/return", protect);
//renew a book
router.post("/renew", protect);
