//functions for the routes of borrowing a book
import Book from "../../src/models/Book.js";
import Borrow from "../../src/models/Borrow.js"; 
import User from "../../src/models/User.js";

//get all the borrowed books from the user (either using or returned)
export const getAllBorrowedBooksByUser = async(req, res) => {
    try {
        const userId = req.user._id;

        const { status } = req.query;
        let query = {userId: userId};

        if (status === "using") query.returnedAt = null;
        if (status === "returned") query.returnedAt = { $ne: null };

        const borrowedBooks = await Borrow.find(query).sort({createdAt: -1});

        res.status(200).json({
            count: borrowedBooks.length,
            borrowedBooks,
        });

    } catch (error) {
        console.error("failed to match borrowed book to user", error);
        res.status(500).json({message: "failed to fetch borrowed books"});
    };
};

//borrow a book
export const borrowABook = async(req, res) => {
    try {
        const userId = req.user._id;
        const { bookId } = req.body;
        if (!userId) return res.status(404).json({message: "user not found"});

        //set due date of the book
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14);

        const borrow = new Borrow({
            userId: userId,
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
export const returnABook = async(req, res) => {
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
            book.status = "available";
            await book.save();
        };
    
        res.status(200).json({message: "Book returned Successfully", borrow});   
    } catch (error) {
        console.log("return failed", error);
        res.status(500).json({message: "return failed"});
    };
};

//renew a book the user is currently borrowing, only on the last day
export const renewABook = async(req, res) => {
    try {
        const userId = req.user._id;
        const { bookId } = req.body;
    
        const borrow = await Borrow.findOne({
            userId,
            bookId,
            returnedAt: null,
        });
        if (!borrow) return res.status(404).json({message: "no active borrow found"});
    
        if (borrow.renew >= 3) return res.status(400).json({message: "book has been renewed max number of times. Must return first, then borrow it again"});

        // Only allow renewal within 3 days of due date
        const daysUntilDue = Math.ceil((borrow.dueDate - new Date()) / (1000 * 60 * 60 * 24));
        if (daysUntilDue > 3) {
            return res.status(400).json({message: "Can only renew within 3 days of due date"});
        }
    
        borrow.dueDate = new Date(borrow.dueDate);
        borrow.dueDate.setDate(borrow.dueDate.getDate() + 14);
        
        borrow.renew += 1;
        await borrow.save();
    
        res.status(200).json({message: "book has been successfully renewed", borrow});    
        
    } catch (error) {
        console.log("renew failed", error);
        res.status(500).json({message: "renew failed"});
    };
};

export const getOverdue = async(req, res) => {
    try {
        const userId = req.user._id;

        const now = new Date();
    
        const overdue = await Borrow.find({
            userId: userId,
            returnedAt: null,
            dueDate: { $lt: now },
        }).sort({ dueDate: 1 });
    
        res.status(200).json({count: overdue.length, borrowedBooks: overdue});   
        
    } catch (error) {
        console.log("failed getting overdue books:", error);
        res.status(500).json({message: "failed getting overdue books"});
    }

};


