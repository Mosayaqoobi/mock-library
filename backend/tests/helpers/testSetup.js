//resuable test setup code (DB setup, test data, helper functions)
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import app from "../../server.js";

let mongoServer;

export const testUserData = {
    username: "testuser",
    email: "test@test.com",
    password: "pass1"
};
export const testBookData = {
    title: "Harry Potter",
    coverimg: "http://example.com/hp.jpg",
    details: "A wizard story",
    genres: ["Fantasy", "Adventure"],
    rating: 4.5
};
export const testNewUserData = {
    newUsername: "newUsername",
    newPassword: "newPassword",
    confirmNewPassword: "newPassword",
    confirmOldPassword: testUserData.password,
};

//connect to mongoDB sever
export const setupTestDB = async() => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
};

//clear all the collections in the db
export const clearTestDB = async() => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
};
//disconnect the mongoDB memory server
export const teardownTestDB = async() => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
    }
    if (mongoServer) {
        await mongoServer.stop();
    }
};
//makes a request to make an account, and returns the token for valid access to the website
export const accountTestDB = async() => {
    const res =  await request(app)
    .post("/api/auth/register")
    .send(testUserData);
    return res.body.token;
}


