import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export const UserSchema = new Schema({
    email: {
        type: String,
        required: 'Enter a email'
    },
    password: {
        type: String,
        required: 'Enter a password'
    },
    firstName: {
        type: String,
        required: 'Enter a first name'
    },
    lastName: {
        type: String,
        required: 'Enter a last name'
    },
    //........
    created_date: {
        type: Date,
        default: Date.now
    }
});
