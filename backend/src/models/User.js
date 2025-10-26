//this file creates the model for the users

import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
},  
{timestamps: true});

userSchema.pre("save", async function(next) {

    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

userSchema.methods.matchPassword = async function(enteredPassword) {    //takes plaintext password

    return await bcrypt.compare(enteredPassword, this.password);    //compares the entered password to the hashed password in the db
}

const User = mongoose.model("user", userSchema);

export default User;
