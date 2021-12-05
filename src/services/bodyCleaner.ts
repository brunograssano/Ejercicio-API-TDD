

interface SignUpData {
    username?:string;
    password?:string;
    firstName?:Object;
    lastName?:Object;
    email?:Object;
    gender?:Object;
    nickname?:Object;
    secondaryEmails?:Object;
    preferences?:Object;
}

interface UpdateUserData {
    firstName?:Object;
    lastName?:Object;
    gender?:Object;
    nickname?:Object;
    secondaryEmails?:Object;
    preferences?:Object;
    photo?:Object;
}

export function getSignUpData(requestBody:Object) {
    let body = requestBody as SignUpData;
    let signUpData : SignUpData = {};
    signUpData.email = body.email;
    signUpData.firstName = body.firstName;
    signUpData.lastName = body.lastName;
    signUpData.gender = body.gender;
    signUpData.nickname = body.nickname;
    signUpData.username = body.username;
    signUpData.password = body.password;
    signUpData.secondaryEmails = body.secondaryEmails;
    signUpData.preferences = body.preferences;
    return signUpData;
}

export function getUpdatedDataFromUser(requestBody:Object) {
    let body = requestBody as UpdateUserData;
    let updatedData : UpdateUserData = {};
    updatedData.firstName = body.firstName;
    updatedData.lastName = body.lastName;
    updatedData.gender = body.gender;
    updatedData.nickname = body.nickname;
    updatedData.secondaryEmails = body.secondaryEmails;
    updatedData.preferences = body.preferences;
    updatedData.photo = body.photo;
    return updatedData as Object;
}