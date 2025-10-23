//resuable test setup code (DB setup, test data, helper functions)
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

export const testUserData = {
    username: "testuser",
    email: "test@test.com",
    password: "pass1"
};
export const testBookData = {
    title: "test",
    coverimg: "http://test",
    details: "test description",
    genres: ["horror", "romance"],
    rating: 4.95,
};

//connect to mongoDB sever
export const setupTestDB = async() => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
};

//clear all the collections in the db
export const clearTestDB = async() => {
    const collections = mongoose.connect.collections;
    for (const key in collections) {
        await collections[key].deletemMany({});
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


