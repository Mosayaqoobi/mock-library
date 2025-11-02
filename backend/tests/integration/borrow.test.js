import request from "supertest";
import { clearTestDB, accountTestDB, testUserData, testBookData  } from "../helpers/testSetup";
import Book from "../../src/models/Book";
import app from "../../server.js";
import Borrow from "../../src/models/Borrow.js";


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
        });
    });

    describe("get all borrowed books by user", () => {
        it("get all borrowed books", async() => {
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
    describe("return a book", () => {
        it("return a book", async () => {
        const book = await Book.create(testBookData);
        const beforeBorrow = await request(app)
            .post("/api/borrow/return")
            .set("Authorization", `Bearer ${token}`)
            .send({bookId: book._id});
        //should return 404 because no books have been borrowed by this user
        expect(beforeBorrow.statusCode).toBe(404);

        //add a borrow for the user
        const borrowRes = await request(app)
            .post("/api/borrow/")
            .set("Authorization", `Bearer ${token}`)
            .send({bookId: book._id});

        expect(borrowRes.statusCode).toBe(201);

        //return the book
        const res = await request(app)
            .post("/api/borrow/return/")
            .set("Authorization", `Bearer ${token}`)
            .send({bookId: book._id});
        
        expect(res.statusCode).toBe(200);
        });
    });

    describe("renew a book", () => {
        it("renew a book", async() => {
            const book = await Book.create(testBookData);

            const beforeBorrow = await request(app)
                .post("/api/borrow/")
                .set("Authorization", `Bearer ${token}`)
                .send({bookId: book._id});
            //should return 404 because no books have been borrowed by this user
            expect(beforeBorrow.statusCode).toBe(201);

            //renew the book
            const res = await request(app)
                .post("/api/borrow/renew/")
                .set("Authorization", `Bearer ${token}`)
                .send({bookId: book._id});

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("Can only renew within 3 days of due date");

            
        });
    });
    describe("get overdue books", () => {
        it("get overdue books", async() => {
            const book = await Book.create(testBookData);

            //borrow a book
            const borrow = await request(app)
                .post("/api/borrow/")
                .set("Authorization", `Bearer ${token}`)
                .send({bookId: book._id});

            expect(borrow.statusCode).toBe(201);

            const borrowRecord = await Borrow.findOne({
                bookId: book._id,
                returnedAt: null,
            });

            borrowRecord.dueDate = new Date();
            borrowRecord.dueDate.setDate(borrowRecord.dueDate.getDate() - 100);
            borrowRecord.save();
            //get the overdue books
            const res = await request(app)
                .get("/api/borrow/overdue")
                .set("Authorization", `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.count).toBe(1);
        });
    });
});