//file for the testing of users apis

import request from "supertest";
import User from "../../src/models/User.js";
import app from "../../server.js";
import { teardownTestDB, setupTestDB, testUserData, clearTestDB, accountTestDB, testNewUserData } from "../helpers/testSetup";

describe("Users Test's", () => {
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
    });
    describe("test user update", () => {
        it("update users username or password, or both", async() => {

            const res = await request(app)
            .put("/api/users/profile")
            .set("Authorization", `Bearer ${token}`)
            .send(testNewUserData);
        
        //test status code
        expect(res.statusCode).toBe(200);

        expect(res.body.username).toBe(testNewUserData.username);
        });
    })

    describe("test user deletion", () => {
        it("should delete the user", async() => {
            const res = await request(app)
            .delete("/api/users/profile")
            .set("Authorization", `Bearer ${token}`)

            expect (res.statusCode).toBe(200);
            //shouldnt be in the db anymore, return null
            const deletedUser = await User.findById(res.body.userId);
            expect(deletedUser).toBeNull();

        });
    });
});