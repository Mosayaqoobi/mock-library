//unit test for the user schema
import User from "../../../src/models/User.js";
import { teardownTestDB, setupTestDB, clearTestDB, testUserData } from "../../helpers/testSetup.js";


describe("User Model", () => {
    //creates the in-memory DB (RAM for fast processing)
    beforeAll(async() => {
        await setupTestDB();
    });
    //for each test, delete all the users
    afterEach(async() => {
        await clearTestDB();
    });
    //close the db after all the tests
    afterAll(async() => {
        await teardownTestDB();
    });

                            //required fields test
    describe("required Fields", () => {
        it("should create user with all required fields", async() => {
            const userData = testUserData;

            const user = await User.create(userData);

            //check if the passwords match
            const isMatch = await user.matchPassword(userData.password);

            expect(user.email).toBe(testUserData.email);
            expect(user.username).toBe(testUserData.username);
            expect(isMatch).toBe(true);
        });
    });
});