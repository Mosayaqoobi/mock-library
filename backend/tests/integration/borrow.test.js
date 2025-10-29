import request from "supertest";
import Borrow from "../../src/models/Borrow.js";
import { clearTestDB, accountTestDB, testUserData, testBookData  } from "../helpers/testSetup";
import Book from "../../src/models/Book";
import app from "../../server.js";
import User from "../../src/models/User.js";

describe("Borrow tests", () => {
    let token;

    beforeEach(async ()=> {
        await clearTestDB();
        token = await accountTestDB();
    });

    describe("borrow a book", () => {
        it("borrow a book", async() => {
            const book = await Book.create(testBookData);

            const res = await request(app)
            .post("/api/borrow/")
            .set("Authorization", `Bearer ${token}`)
            .send({bookId: book._id});

            //borrow a book
            expect(res.statusCode).toBe(201);

        })
    })

    describe("get all borrowed books by user", () => {
        it("return all borrowed books", async() => {
            //make a request to the endpoint
            const book = await Book.create(testBookData);

            const borrowRes = await request(app)
                .post("/api/borrow/")
                .set("Authorization", `Bearer ${token}`)
                .send({bookId: book._id});

            expect(borrowRes.statusCode).toBe(201);

            const res = await request(app)
            .get("/api/borrow/")
            .set("Authorization", `Bearer ${token}`);

            //user has no borrowed books, should return 0 books
            expect(res.statusCode).toBe(200);
            expect(res.body.count).toBe(1);

        });
    });
});