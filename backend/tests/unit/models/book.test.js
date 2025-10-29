//unit test for the book schema
import Book from "../../../src/models/Book.js";
import { clearTestDB, testBookData } from "../../helpers/testSetup.js";

describe("Book Model", () => {

    beforeEach(async() => {
        await clearTestDB();
    });

    //required fields test
    describe("Required Fields", () => {
        it("should create a book with all required fields", async() => {
            let bookData = testBookData;

            const book = await Book.create(bookData);

            expect(book.title).toBe(bookData.title);
            expect(book.coverimg).toBe(bookData.coverimg);
            expect(book.details).toBe(bookData.details);
            expect(book.genres).toEqual(bookData.genres);
            expect(book.rating).toBe(bookData.rating);
        });
    });
});