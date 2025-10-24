//tests the auth middleware in context for users in integration environment, by accessing the profiles tab

import request from "supertest";
import app from "../../../server.js";
import { clearTestDB, setupTestDB, teardownTestDB, testUserData, accountTestDB } from "../../helpers/testSetup.js";


describe("Authenticaiton middleware", () => {
    let token;

    beforeAll(async() => {
        await setupTestDB();
    });
    afterAll(async() => {
        await teardownTestDB();
    });

    beforeEach(async() => {
        token = await accountTestDB();
    });
    afterEach(async() => {
        await clearTestDB();
    })

    describe("protect middleware integration", () => {
        it("allow access including valid token", async() => {
            const res = await request(app)
               .put("/api/users/profile")
               .set("Authorization", `Bearer ${token}`)
               .send({username: "updated"});
        
            expect(res.statusCode).toBe(200);
        });
    })
});