//a file for the testing of the books apis

import request from "supertest";
import app from "../../server.js";
import { clearTestDB, accountTestDB, testBookData } from "../helpers/testSetup.js";
import Book from "../../src/models/Book.js";

describe("Book Tests", () => {
    let token;

    beforeEach(async() => {
        await clearTestDB();
        token = await accountTestDB();
    });
    
    describe("test book Search for valid users", () => {
        it("return 5 books", async() => {
            //send a request, with the credentials, and make a book object
            await Book.create(testBookData);
            const res = await request(app)
            .get("/api/books/search?limit=1")
            .set("Authorization", `Bearer ${token}`)

            //test structure
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("results");
            expect(res.body).toHaveProperty("count");

            //test for not empty
            expect(res.body.results).toBeInstanceOf(Array);
            expect(res.body.results.length).toBeGreaterThan(0);

            //(should return 1 book)
            expect(res.body.results.length).toBe(1);
            expect(res.body.count).toBe(1);
            
            //test the structure
            const book = res.body.results[0];
            expect(book).toHaveProperty("title");
            expect(book).toHaveProperty("rating");
            expect(book).toHaveProperty("genres");
            expect(book.genres).toEqual(["Fantasy", "Adventure"])
        });
    });

    describe("test book search given ID", () => {
        it("return A book", async() => {

            const book = await Book.create(testBookData);

            const res = await request(app)
            .get(`/api/books/${book._id}`)
            .set("Authorization",`Bearer ${token}`);
            //should have a statusCode of 200
            expect(res.statusCode).toBe(200);

            //have the same properties
            expect(res.body).toHaveProperty("title", "Harry Potter");
            expect(res.body).toHaveProperty("rating", 4.5);
            expect(res.body).toHaveProperty("genres");
            expect(res.body.genres).toEqual(["Fantasy", "Adventure"]);

            //test the borrow fields
            expect(res.body).toHaveProperty("isAvailable", true);
            expect(res.body).toHaveProperty("borrowedBy", null);
            expect(res.body).toHaveProperty("dueDate", null);
        });
    });
    
});

