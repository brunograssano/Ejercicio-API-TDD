import {User, UserView} from "../models/userModel";
import {HydratedDocument} from "mongoose";

interface Filters {
    username?:Object;
    firstName?:Object;
    lastName?:Object;
    email?:Object;
    gender?:Object;
    nickname?:Object;
    contacts?:Object;
    preferences?:Object;
}


interface QuerySearch {
    username?:Object;
    "firstName.value"?:Object;
    "firstName.public"?:Object;
    "lastName.value"?:Object;
    "lastName.public"?:Object;
    "email.value"?:Object;
    "email.public"?:Object;
    "gender.value"?:Object;
    "gender.public"?:Object;
    "nickname.value"?:Object;
    "nickname.public"?:Object;
    "contacts.value"?:Object;
    "contacts.public"?:Object;
    preferences?:Object;
}


export const getSearchQuery = (queryValues: Object) : Object => {
    let searchValues : Filters = queryValues as Filters;
    let query : QuerySearch = {};
    if (searchValues == null) {
        return query;
    }

    if(searchValues.username != ""){
        query.username = {"$regex":searchValues.username};
    }

    if(searchValues.firstName != ""){
        query["firstName.value"] = {"$regex":searchValues.firstName};
        query["firstName.public"] = true;
    }

    if(searchValues.lastName != ""){
        query["lastName.value"] = {"$regex":searchValues.lastName};
        query["lastName.public"] = true;
    }

    if(searchValues.email != ""){
        query["email.value"] = {"$regex":searchValues.email};
        query["email.public"] = true;
    }

    if(searchValues.gender != ""){
        query["gender.value"] = {"$regex":searchValues.gender};
        query["gender.public"] = true;
    }

    if(searchValues.nickname != ""){
        query["nickname.value"] = {"$regex":searchValues.nickname};
        query["nickname.public"] = true;
    }

    if(searchValues.contacts != ""){
        query["contacts.value"] = {"$in":searchValues.contacts};
        query["contacts.public"] = true;
    }

/*
    if(searchValues.preferences != []){
        query.preferences = {"$elemMatch":{"value":{"$in":searchValues.preferences},"public":true}};
    }
*/

    return query;
}

export function getPublicFieldsFromUsers(users: HydratedDocument<User, {}, {}>[]) {
    let usersResponse :  UserView[] = [];
    let tempUser : UserView = {};
    users.forEach(function (user) {
        tempUser.username = user.username;
        if (user.firstName["public"]) {
            tempUser.firstName = user.firstName["value"];
        }
        if (user.lastName["public"]) {
            tempUser.lastName = user.lastName["value"];
        }
        if (user.email["public"]) {
            tempUser.email = user.email["value"];
        }
        if (user.gender && user.gender["public"]) {
            tempUser.gender = user.gender["value"];
        }
        if (user.nickname && user.nickname["public"]) {
            tempUser.nickname = user.nickname["value"];
        }
        if (user.contacts && user.contacts["public"]) {
            tempUser.contacts = user.contacts["name"];
        }

        tempUser.secondaryEmails = [];
        user.secondaryEmails.forEach(function (email) {
            if (email.public && tempUser.secondaryEmails) {
                tempUser.secondaryEmails.push(email.value);
            }
        })

        tempUser.preferences = [];
        user.preferences.forEach(function (preference) {
            if (preference.public && tempUser.preferences) {
                tempUser.preferences.push({preferenceType:preference.preferenceType,value:preference.value});
            }
        })

        usersResponse.push({...tempUser});
        tempUser = {}
    })
    return usersResponse;
}