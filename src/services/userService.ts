import {NextFunction, RequestHandler} from "express";
import {Callback, model} from 'mongoose';
import {UserSchema, UserView} from '../models/userModel';
import {basicAuth, SALT_ROUNDS} from "./authService";
import bcrypt from 'bcrypt'
import {getPublicFieldsFromUsers, getSearchQuery} from "./queryServices";
import {getSignUpData, getUpdatedDataFromUser} from "./bodyCleaner";

export const User = model('User', UserSchema);



export const addNewUser: RequestHandler = (request, response,next: NextFunction) => {
    const credentials = basicAuth(request.headers.authorization as string);
    const username = credentials[0];
    bcrypt.hash(credentials[1],SALT_ROUNDS,(error, hash) => {
        request.body.username = username;
        request.body.password = hash;
        let newUser = new User(getSignUpData(request.body));
        newUser.id = newUser._id;
        newUser.save((error, user) => {
            if (error) {
                response.send(error);
                return;
            }
            response.locals = {...response.locals,
                username: user.username,
                id: user.id,
                email: user.email.value,
            }

            next()
        });
    });
}


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


export const changeMainEmail: RequestHandler = (request, response,next) => {
    let mainEmail = request.body.email
    User.findOneAndUpdate(
        { _id: response.locals.session.id},
        {"email.value":mainEmail,"email.validated":false},
        { new: true, useFindAndModify: false },
        (error, user) => {
            if (error) {
                response.send(error);
                return;
            }
            next();
        }
    );
}

export const updateUser: RequestHandler = (request, response) => {
    User.findOneAndUpdate(
        { _id: response.locals.session.id},
        getUpdatedDataFromUser(request.body),
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

    User.findOne({username: username}, null,null,(error, user) => {
            if (!user) {
                response.status(404).send({message:"User not found"});
                return;
            }
            bcrypt.compare(credentials[1],user.password,(error, areTheSame) => {
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
                    username: user.username,
                    id: user.id,
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

export const searchUsers: RequestHandler = (request, response) => {

    let searchQuery = getSearchQuery(request.query);

    User.find(searchQuery,{password:0,_id:0,__v:0,created_date:0},null,
        (error, users) => {
        if (error) {
            response.send(error);
            return;
        }

        let usersResponse :  UserView[] = getPublicFieldsFromUsers(users);

        response.json(usersResponse);
    });
}

export const getPhotoFromUser: RequestHandler = (request, response) => {
    User.findOne({username: request.params.username}, {_id:0,username:1,photo:1},null,
        (error, user) => {
        if (error) {
            response.send(error);
            return;
        }

        if (!user){
            response.status(400).json({message: "There are no users with that username"});
            return;
        }

        if (!user.photo){
            response.json({message: "There is no photo"});
            return;
        }

        if (!user.photo.public){
            response.json({message: "The photo is private"});
            return;
        }

        response.json({message:"Photo sent successfully",payload:{username:user.username,photo:user.photo}});
    });
}

export const forgotPassword: RequestHandler = (request, response,next) => {
    User.findOne({username: request.body.username}, {_id:1,email:1,username:1},null,
        (error, user) => {
            if (error) {
                response.send(error);
                return;
            }
            if (!user){
                response.status(400).json({message: "There are no users with that username"});
                return;
            }

            response.locals = {
                ...response.locals,
                username: user.username,
                id: user.id,
                email: user.email.value,
            };

            next()
        });
}