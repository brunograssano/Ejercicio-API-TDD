import {RequestHandler} from "express";
import {model} from 'mongoose';
import {UserProfilePhotoSchema, UserSchema, UserView} from '../models/userModel';
import {getPublicFieldsFromUsers, getSearchQuery} from "./queryServices";

export const User = model('User', UserSchema);
export const UserProfilePhoto = model('UserProfilePhoto', UserProfilePhotoSchema);

export const getUsers: RequestHandler = (request, response) => {
    User.find({}, (error, users) => {
        if (error) {
            response.status(400).send(error);
            return;
        }
        response.json(users);
    });
}

export const getUserWithID: RequestHandler = (request, response) => {
    User.findById(response.locals.session.id, {photo:0,__v:0,password:0}, null, (error, user) => {
        if (error) {
            response.send(error);
            return;
        }
        response.json({message:"User sent successfully.",user:user});
    });
}

export const searchUsers: RequestHandler = (request, response) => {

    let searchQuery = getSearchQuery(request.query);

    User.find(searchQuery,{password:0,_id:0,__v:0,created_date:0},null,
        (error, users) => {
        if (error) {
            response.send(error);
            return;
        }

        let usersResponse :  UserView[] = getPublicFieldsFromUsers(users);

        response.json({message:"Searched successfully", users:usersResponse});
    });
}

export const getPhotoFromUser: RequestHandler = (request, response) => {
    UserProfilePhoto.findOne({username: request.params.username}, {_id:0,username:1,photo:1},null,
        (error, userPhoto) => {
        if (error) {
            response.send(error);
            return;
        }

        if (!userPhoto){
            response.status(400).json({message: "There are no users with that username"});
            return;
        }

        if (!userPhoto.photo){
            response.json({message: "There is no photo"});
            return;
        }

        if (!userPhoto.photo.public){
            response.json({message: "The photo is private"});
            return;
        }

        response.json({message:"Photo sent successfully",payload:{username:userPhoto.username,photo:userPhoto.photo.value}});
    });
}