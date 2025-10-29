//unit test for the user schema
import User from "../../../src/models/User.js";
import { clearTestDB, testUserData } from "../../helpers/testSetup.js";


describe("User Model", () => {
    beforeEach(async() => {
        await clearTestDB();
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