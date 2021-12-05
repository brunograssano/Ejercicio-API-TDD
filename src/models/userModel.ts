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

type UniqueValueField = {
    value: string;
    public: boolean;
}

type EmailField = {
    value: string;
    public: boolean;
    validated: boolean;
}

type User = {
    id:string
    email: EmailField;
    password: string;
    firstName: UniqueValueField;
    lastName: UniqueValueField;
    username: string;
    photo: UniqueValueField;
    nickname: UniqueValueField;
    gender: UniqueValueField;
    preferences: PreferenceField[];
    secondaryEmails: UniqueValueField[];
    contacts: MultipleValuesInField;
    pendingContacts: string[];
    created_date: Date;
}

export type UserView = {
    email?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    photo?: string;
    nickname?: string;
    gender?: string;
    preferences?: {preferenceType: string; value:string;}[];
    secondaryEmails?: string[];
    contacts?: string[];
    pendingContacts?: string[];
}

export const UserSchema = new Schema<User>({
    email: {
        type: {
            value: String,
            public: Boolean,
            validated: Boolean,
        },
        unique: true,
        required: [true, 'Enter a email']
    },
    password: {
        type: String,
        required: [true, 'Enter a password']
    },
    firstName: {
        type: {
            value: String,
            public: Boolean,
        },
        required: [true, 'Enter a first name']
    },
    lastName: {
        type: {
            value: String,
            public: Boolean,
        },
        required: [true, 'Enter a last name']
    },
    username: {
        type: String,
        unique: true,
        required: [true, 'Enter a username']
    },
    photo: {
        type: {
            value: String,
            public: Boolean,
        },
    },
    nickname: {
        type: {
            value: String,
            public: Boolean,
        },
    },
    gender: {
        type: {
            value: String,
            public: Boolean,
        },
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
            value: String,
            notifications: Boolean,
            public: Boolean
        }
    ],
    contacts: {
        name: [],
        public: Boolean,
    },
    pendingContacts: [],

    created_date: {
        type: Date,
        default: () => new Date()
    }
});
