import {NextFunction, RequestHandler} from "express";
import { model } from 'mongoose';
import { UserSchema } from '../models/userModel';
import {basicAuth, SALT_ROUNDS} from "./authService";
import bcrypt from 'bcrypt'

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
    User.findById(response.locals.session.id, null, null, (error, user) => {
        if (error) {
            response.send(error);
            return;
        }
        response.json(user);
    });
}

export const updateUser: RequestHandler = (request, response) => {
    User.findOneAndUpdate(
        { _id: response.locals.session.id},
        request.body,
        { new: true, useFindAndModify: false },
        (error, user) => {
            if (error) {
                response.send(error);
                return;
            }
            response.json({ message: 'Successfuly updated user'});
        }
    );
}

export const deleteUser: RequestHandler = (request, response) => {
    User.remove({ _id: response.locals.session.id}, error => {
        if (error) {
            response.send(error);
        }
        response.json({ message: 'Successfuly deleted user'});
    });
}

export const loginUser: RequestHandler =  (request, response,next: NextFunction) => {
    const credentials = basicAuth(request.headers.authorization  as string);
    const username = credentials[0];

    User.find({username: username}, (error, user) => {
            if (user.length==0) {
                response.status(404).send("User not found");
                return;
            }
            bcrypt.compare(credentials[1],user[0].password,(error, areTheSame) => {
                if (error) {
                    response.send(error);
                    return;
                }
                if (!areTheSame) {
                    response.status(404).send("User not found");
                    return;
                }

                response.locals = {
                    ...response.locals,
                    username: user[0].username,
                    id: user[0].id,
                    message: "Succesfully logged in"
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
                    response.status(404).send("User not found");
                    return;
                }

                response.locals = {
                    ...response.locals,
                    username: user.username,
                    id: user.id,
                    message: "Succesfully updated password",
                };

                next();
            }
        );
    });


}
