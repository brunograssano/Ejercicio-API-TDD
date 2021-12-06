import {NextFunction, RequestHandler} from "express";
import {User,UserProfilePhoto} from "./userService";
import {basicAuth, SALT_ROUNDS} from "./authService";
import bcrypt from "bcrypt";
import {getSignUpData, getUpdatedDataFromUser} from "./bodyCleaner";
import {CallbackError} from "mongoose";

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

export const createPhotoUser: RequestHandler = (request, response,next: NextFunction) => {
    const credentials = basicAuth(request.headers.authorization as string);
    const username = credentials[0];
    let newProfilePhotoUser = new UserProfilePhoto({username:username});
    newProfilePhotoUser.save((error, user) => {
        if (error) {
            response.send(error);
            return;
        }
        next()
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

export const addPhotoToUser: RequestHandler = (request, response) => {
    UserProfilePhoto.findOneAndUpdate(
        { username: response.locals.session.username},
        {photo:request.body.photo},
        { new: true, useFindAndModify: false },
        (error, userPhoto) => {
            if (error) {
                response.send(error);
                return;
            }
            response.json({ message: 'Successfully updated photo'});
        }
    );
}

export const deletePhotoUser: RequestHandler = (request, response,next) => {
    UserProfilePhoto.deleteOne({ username: response.locals.session.username}, (error:CallbackError) => {
        if (error) {
            response.send(error);
            return;
        }
        next();
    });
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