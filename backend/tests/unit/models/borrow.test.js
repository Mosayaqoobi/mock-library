import Borrow from "../../../src/models/Borrow.js";
import User from "../../../src/models/User.js";
import Book from "../../../src/models/Book.js";
import { clearTestDB, testUserData, testBookData } from "../../helpers/testSetup.js";

describe("Borrow Model", () => {
    let testUser;
    let testBook;

    beforeEach(async() => {
        await clearTestDB();
        testUser = await User.create(testUserData);
        testBook = await Book.create(testBookData);
    });

    //required fields 
    describe("Required Fields", () => {
        it("should create borrow with all requried fields", async() => {
            const dueDate = new Date(Date.now() + 14 *24 * 60 *60 * 1000);

            const borrowData = {
                userId: testUser._id,
                bookId: testBook._id,
                dueDate: dueDate
            };

            const borrow = await Borrow.create(borrowData);

            expect(borrow.userId).toBe(testUser._id);
            expect(borrow.bookId).toBe(testBook._id);
            expect(borrow.dueDate).toBe(dueDate);
            expect(borrow.renew).toBe(0);
            expect(borrow.returnedAt).toBeNull();
            expect(borrow.createdAt).toBeDefined();
            expect(borrow.updatedAt).toBeDefined();
        });
    });


});