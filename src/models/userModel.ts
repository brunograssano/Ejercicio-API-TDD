import { Schema } from 'mongoose';

type User = {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    //........
    created_date: Date;
}

export const UserSchema = new Schema<User>({
    email: {
        type: String,
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
    //........
    created_date: {
        type: Date,
        default: () => new Date()
    }
});
