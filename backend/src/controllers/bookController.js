//this will be where the functions for getting books, and etc will be 
import Book from "../models/Book.js";
import Borrow from "../models/Borrow.js";

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
        const activeBorrow = await Borrow.findOne({bookId: id, status:'active'}).populate('userId', 'username');
        //send 200 code, with the book object, and if its avilable. if not, whos borrowing, and its dueDate
        res.status(200).json({
        ...book.toObject(),
        isAvailable: !activeBorrow,
        borrowedBy: activeBorrow ? activeBorrow.userId : null,
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
        const { q, genre, rating, author } = req.query;

        //search filter
        let filter = {};

        //search by title
        if (q) filter.title = { $regex: q, $options: "i"};
        //filter by genre
        if (genre) filter.genres = {$regex: genre, $options: "i"};
        //filter by minrating
        if (rating) filter.rating = {$gte: parseFloat(rating) };

        //get the books from the filters
        const books = await Book.find(filter).limit(50).sort({rating: -1});
        //send status code 200 for success
        res.status(200).json({results: books, count: books.length});
    } catch (error) {
        console.error("Search Error:", error);
        res.status(500).json({message: "search failed"});        
    }
}

