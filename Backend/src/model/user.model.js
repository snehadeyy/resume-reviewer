import mongoose from "mongoose";
import { Schema } from "mongoose";

const userSchema = new Schema({
    username: {
        type: String,
        unique: [true, "username already exists"],
        required: true
    },
    email: {
        type: String,
        unique: [true, "Account already exists with this email id"],
        required: true
    },
    password: {
        type: String,
        required: true
    }
})

export const User = mongoose.model("User",userSchema)