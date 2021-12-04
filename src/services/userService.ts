import {NextFunction, RequestHandler} from "express";
import { model } from 'mongoose';
import {UserSchema, UserView} from '../models/userModel';
import {basicAuth, SALT_ROUNDS, validEmail} from "./authService";
import bcrypt from 'bcrypt'
import {getSearchQuery} from "./queryServices";

const User = model('User', UserSchema);

export const addNewUser: RequestHandler = (request, response,next: NextFunction) => {
    const credentials = basicAuth(request.headers.authorization as string);
    const username = credentials[0];
    bcrypt.hash(credentials[1],SALT_ROUNDS,(error, hash) => {
        request.body.username = username;
        request.body.password = hash;

        let newUser = new User(request.body);
        newUser.id = newUser._id;
        newUser.save((error, user) => {
            if (error) {
                response.send(error);
                return;
            }
            response.locals = {...response.locals, username: user.username, id: user.id, message: "User sign up successful"}
            next()
        });
    });
}


export const getUsers: RequestHandler = (request, response) => {
    User.find({}, (error, users) => {
        if (error) {
            response.send(error);
            return;
        }
        response.json(users);
    });
}

export const getUserWithID: RequestHandler = (request, response) => {
    User.findById(response.locals.session.id, {photo:0,__v:0}, null, (error, user) => {
        if (error) {
            response.send(error);
            return;
        }
        response.json(user);
    });
}

export const updateUser: RequestHandler = (request, response) => {

    if(request.body.email && !validEmail(request.body.email)){
        response.status(400).send({ message: 'Not a valid email'});
        return;
    }

    User.findOneAndUpdate(
        { _id: response.locals.session.id},
        request.body,
        { new: true, useFindAndModify: false },
        (error, user) => {
            if (error) {
                response.send(error);
                return;
            }
            response.json({ message: 'Successfully updated user'});
        }
    );
}

export const deleteUser: RequestHandler = (request, response) => {
    User.deleteOne({ _id: response.locals.session.id}, error => {
        if (error) {
            response.send(error);
            return;
        }
        response.json({ message: 'Successfully deleted user'});
    });
}

export const loginUser: RequestHandler =  (request, response,next: NextFunction) => {
    const credentials = basicAuth(request.headers.authorization  as string);
    const username = credentials[0];

    User.find({username: username}, (error, user) => {
            if (user.length==0) {
                response.status(404).send({message:"User not found"});
                return;
            }
            bcrypt.compare(credentials[1],user[0].password,(error, areTheSame) => {
                if (error) {
                    response.send(error);
                    return;
                }
                if (!areTheSame) {
                    response.status(404).send({message:"User not found"});
                    return;
                }

                response.locals = {
                    ...response.locals,
                    username: user[0].username,
                    id: user[0].id,
                    message: "Successfully logged in"
                };

                next();
            });
        }
    );


}

export const updatePassword: RequestHandler =  (request, response,next: NextFunction) => {
    const credentials = basicAuth(request.headers.authorization  as string);
    const username = credentials[0];
    bcrypt.hash(credentials[1],SALT_ROUNDS,(error, hash) => {
        if (error) {
            console.error(error)
            return;
        }
        User.findOneAndUpdate({username: username},
            {password: hash},
            { new: true },
            (err, user) => {
                if (!user) {
                    response.status(404).send({message:"User not found"});
                    return;
                }

                response.locals = {
                    ...response.locals,
                    username: user.username,
                    id: user.id,
                    message: "Successfully updated password",
                };

                next();
            }
        );
    });


}


export const getContacts: RequestHandler = (request, response) => {
    User.findById(response.locals.session.id, {_id:0,contacts:1},null,(error, user) => {
        if (error) {
            response.send(error);
            return;
        }

        if (user?.contacts.name.length == 0){
            response.json({message: "There are no contacts",contacts:[]});
            return;
        }

        User.find({"username": {"$in": user?.contacts.name} },{_id:0,password:0,__v:0,photo:0},null,(errorContacts, contacts) => {
            if (errorContacts) {
                response.send(errorContacts);
                return;
            }

            response.json({message:"Contacts sent successfully",contacts:contacts});
        });

    });
}

export const deleteContact: RequestHandler = (request, response) => {
    User.findByIdAndUpdate(response.locals.session.id,
        {"$pull":{"contacts.name":request.body.name}},
        null,
        (error, user) => {
        if (error) {
            response.send(error);
            return;
        }
        if (user?.contacts.name.length == 0){
            response.status(400).send({message:"There are no contacts to delete"});
            return;
        }
        if (!user?.contacts.name.includes(request.body.name)){
            response.status(400).send({message:"User doesn't have " + request.body.name + " as a contact"});
            return;
        }
        response.json({message:"Contact deleted successfully"});
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

        response.json(usersResponse);
    });
}

export const getPhotoFromUser: RequestHandler = (request, response) => {
    User.find({username: request.params.username}, {_id:0,username:1,photo:1},null,
        (error, users) => {
        if (error) {
            response.send(error);
            return;
        }

        if (users.length == 0){
            response.status(400).json({message: "There are no users with that username"});
            return;
        }

        if (!users[0].photo){
            response.json({message: "There is no photo"});
            return;
        }

        if (!users[0].photo.public){
            response.json({message: "The photo is private"});
            return;
        }

        response.json({message:"Photo sent successfully",payload:{username:users[0].username,photo:users[0].photo}});
    });
}