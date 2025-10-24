//a file for the testing of the books apis

import request from "supertest";
import app from "../../server.js";
import { teardownTestDB, setupTestDB, clearTestDB, accountTestDB, testUserData } from "../helpers/testSetup.js";
import Book from "../../src/models/Book.js";

describe("Book Tests", () => {
    let token;

    beforeAll(async() => {
        await setupTestDB();
    });
    afterAll(async() => {
        await teardownTestDB();
    });
    beforeEach(async() => {
        await clearTestDB();
        token = await accountTestDB();
    })
    describe("test book Search for valid users", () => {
        it("return 5 books", async() => {
            await Book.create([
                {
                    title: "Harry Potter",
                    coverimg: "http://example.com/hp.jpg",
                    details: "A wizard story",
                    genres: ["Fantasy", "Adventure"],
                    rating: 4.5
                },
                {
                    title: "Lord of the Rings",
                    coverimg: "http://example.com/lotr.jpg",
                    details: "Epic fantasy",
                    genres: ["Fantasy", "Epic"],
                    rating: 4.8
                }
            ]);
            //send a request, with the credentials
            const res = await request(app)
            .get("/api/books/search?limit=1")
            .set("Authorization", `Bearer ${token}`)

            //test structure
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('results');
            expect(res.body).toHaveProperty('count');

            //test for not empty
            expect(res.body.results).toBeInstanceOf(Array);
            expect(res.body.results.length).toBeGreaterThan(0);

            //(should return 1 book)
            expect(res.body.results.length).toBe(1);
            expect(res.body.count).toBe(1);
            
            //test the structure
            let book = res.body.results[0];
            expect(book).toHaveProperty('title');
            expect(book).toHaveProperty('rating');
            expect(book).toHaveProperty('genres');
            expect(book.genres).toBeInstanceOf(Array);
        });
    });
    
});

