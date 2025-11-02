//this will be where the functions for getting books, and etc will be 
import Book from "../models/Book.js";
import Borrow from "../models/Borrow.js";
import User from "../models/User.js";

//"/books/:id"
export const getBookById = async(req, res) => {

    try {
        //gets the parameter (id)
        const { id } = req.params
        //search the db for this book
        const book = await Book.findById(id);
        //if it doesnt exist, send 500 code, with error
        if (!book) return res.status(404).json({message: "Book not found"});
        //get the borrow information for this book, to display
        let activeBorrow = null;
        try {
            activeBorrow = await Borrow.findOne({bookId: id, returnedAt: null})
                .populate("userId", "username");
        } catch (populateError) {
            console.error("Error populating borrow:", populateError);
            // Try without populate as fallback
            activeBorrow = await Borrow.findOne({bookId: id, returnedAt: null});
        }
        
        // Build response object
        const bookObject = book.toObject();
        let borrowedBy = null;
        
        if (activeBorrow && activeBorrow.userId) {
            // Check if populated (has username property) or just ObjectId
            if (activeBorrow.userId.username) {
                // Successfully populated
                borrowedBy = {
                    _id: activeBorrow.userId._id.toString(),
                    username: activeBorrow.userId.username
                };
            } else {
                // Not populated, just ObjectId
                borrowedBy = {
                    _id: activeBorrow.userId.toString(),
                    username: 'Unknown'
                };
            }
        }
        
        // send 200 code
        // book object
        // if its avilable
        // if not, whos borrowing
        // dueDate
        res.status(200).json({
            ...bookObject,
            isAvailable: !activeBorrow,
            borrowedBy: borrowedBy,
            dueDate: activeBorrow ? activeBorrow.dueDate : null
        });
        //catch server errors
    } catch (error) {
        console.error("Error fetching book:", error);
        res.status(500).json({message: "Server error"});
    }
}
// "/books/search?q=xyz&genre=w&minrating=i"
export const searchBooks = async(req, res) => {
    try {
        const { q, genre, rating, limit } = req.query;

        //search filter
        let filter = {};

        //search by title
        if (q) filter.title = { $regex: q, $options: "i"};
        //filter by genre
        if (genre) filter.genres = {$regex: genre, $options: "i"};
        //filter by minrating
        if (rating) filter.rating = {$gte: parseFloat(rating) };

        //get the books from the filters
        const books = await Book.find(filter).limit(limit).sort({rating: -1});
        //send status code 200 for success
        res.status(200).json({results: books, count: books.length});
    } catch (error) {
        console.error("Search Error:", error);
        res.status(500).json({message: "search failed"});        
    }
}

