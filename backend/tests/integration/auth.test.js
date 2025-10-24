//this file will run tests for login and register

import request from "supertest";
import app from "../../server.js";
import { teardownTestDB, setupTestDB } from "../helpers/testSetup.js";

describe("Auth Tests", () => {

    //create a in-memory mongoDB
    beforeAll(async() => {
        await setupTestDB();
    })

    //after all the tests, close the db connection
    afterAll(async () => {
        await teardownTestDB();
    });

    //register a new user
    it("should register a new user", async () => {
        const res = await request(app)
        .post("/api/auth/register")
        .send({
            username: "testuser",
            email: "user@user.com",
            password: "password123",
        });

        if (res.statusCode !== 201) {
            console.error("Error response:", res.body);
        }
        //check the status code
        expect(res.statusCode).toBe(201);
        //check if token is there
        expect(res.body.token).toBeDefined();
    });

    //login a user
    it("should login an existing user", async () => {
        await request(app)
        .post("/api/auth/register")
        .send({
            username: "login",
            email: "log@log.com",
            password: "pass",
        });

        //login with the same credentials
        const res = await request(app)
        .post("/api/auth/login")
        .send({
            email: "log@log.com",
            password: "pass",
        });

        //check status code
        expect(res.statusCode).toBe(200);
        //check if token is there of the user
        expect(res.body.token).toBeDefined();
    });
});


