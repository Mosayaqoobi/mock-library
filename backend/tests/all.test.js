import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import "./integration/auth.test.js";
import "./integration/book.test.js";
import "./integration/borrow.test.js";
import "./integration/user.test.js";
import "./integration/middleware/auth.test.js";
import "./unit/models/user.test.js";
import "./unit/models/book.test.js";
import "./unit/models/borrow.test.js";

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
});

afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
    }
    if (mongoServer) {
        await mongoServer.stop();
    }
});
