import { Schema } from 'mongoose';

type PreferenceField = {
    preferenceType: string;
    value: string;
    public: boolean;
}

type MultipleValuesInField = {
    name: string[];
    public: boolean;
}

type User = {
    id:string
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    username: string;
    photo: string;
    nickname: string;
    gender: string;
    preferences: PreferenceField[];
    secondaryEmails: string[];
    contacts: MultipleValuesInField;
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
            preferenceType: String,
            value: String,
            public: Boolean,
        }
    ],
    secondaryEmails: [
        {
            email: String,
            notifications: Boolean,
            public: Boolean
        }
    ],
    contacts: {
        name: [],
        public: Boolean,
    },

    created_date: {
        type: Date,
        default: () => new Date()
    }
});
