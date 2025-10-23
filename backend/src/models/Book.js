//this file holds the model for the books (in mongoDB)
import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    coverimg: {
        type: String
    },
    details: {
        type: String
    },
    genres: {
        type: [String],
        default: []
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
}, 
    {
    timestamps: true
    });

const Book = mongoose.model("book", bookSchema);

export default Book;