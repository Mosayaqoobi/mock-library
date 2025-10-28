//functions for the routes of borrowing a book

import User from "../models/User.js";
import Borrow from "../models/Borrow.js";
import Book from "../models/Book.js";
import { protect } from "../middleware/auth.js";
import express from "express";

//get all the borrowed books from the user (either using or returned)
export const getUserBorrowedBooks = async(req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const { status } = req.query;

        if (!user) return res.status(404).json({message: "user not found"});

        let query = {userId: user._id};

        if (status === "using") query.returnedAt = null;
        if (status === "returned") query.returnedAt = { $ne: null };

        const borrowedBooks = await Borrow.find(
            query,
        ).populate("bookId", "title coverimg details genres rating")
        .sort({createdAt: -1}); //get the most recent

        res.status(200).json({
            count: borrowedBooks.length,
            borrowedBooks,
        });

    } catch (error) {
        console.error("failed to match borrowed book to user");
        res.status(500).json({message: "failed to fetch borrowed books"});
    };
};

//borrow a book
export const borrowBook = async(req, res) => {
    try {
        const user = req.user._id;
        const { bookId } = req.body;
        if (!user) return res.status(404).json({message: "user not found"});

        //set due date of the book
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() = 14);

        const borrow = new Borrow({
            userId: user._id,
            bookId: bookId,
            dueDate: dueDate,
        });

        const book = await Book.findById(bookId);
        if (!book) return res.status(404).json({message: "book not found"});
        if(book.status === "borrowed") return res.status(400).json({message: "book is currently borrowed"});
        book.status = "borrowed";
        await book.save();

        await borrow.save();
        res.status(201).json({message: "book borrowed successfully", borrow});

    } catch (error) {
        console.log("borrow failed", error);
        res.status(500).json({message: "borrow failed"});
    };
};

//return a book
export const returnBook = async(req, res) => {
    try {
        const userId = req.user._id;
        const { bookId } = req.body;
    
        const borrow = await Borrow.findOne({
            userId,
            bookId,
            returnedAt: null,
        });
        if (!borrow) return res.status(404).json({message: "No active borrow found"});
    
        //update the books returnedAt
        borrow.returnedAt = new Date();
        await borrow.save();
    
        const book = await Book.findById(bookId);
        if (book) {
            book.status = "available",
            await book.save();
        };
    
        res.status(200).json({message: "Book returned Successfully", borrow});   
    } catch (error) {
        console.log("return failed", error);
        res.status(500).json({message: "return failed"});
    };
};

