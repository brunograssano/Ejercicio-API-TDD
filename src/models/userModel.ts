import { Schema } from 'mongoose';

type User = {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    username: string;
    photo: string;
    nickname: string;
    gender: string;
    preferences: string[];

    created_date: Date;
}

export const UserSchema = new Schema<User>({
    email: {
        type: String,
        unique: true,
        required: [true, 'Enter a email']
    },
    password: {
        type: String,
        required: [true, 'Enter a password']
    },
    firstName: {
        type: String,
        required: [true, 'Enter a first name']
    },
    lastName: {
        type: String,
        required: [true, 'Enter a last name']
    },
    username: {
        type: String,
        unique: true,
        required: [true, 'Enter a username']
    },
    photo: {
        value: String,
        public: Boolean,
    },
    nickname: {
        value: String,
        public: Boolean,
    },
    gender: {
        value: String,
        public: Boolean,
    },
    preferences: [
        {
        value: String,
        public: Boolean,
        }
    ],


    created_date: {
        type: Date,
        default: () => new Date()
    }
});
