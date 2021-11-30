import {NextFunction, RequestHandler} from "express";
import { model } from 'mongoose';
import { UserSchema } from '../models/userModel';
import {basicAuth, SALT_ROUNDS} from "./authService";
import bcrypt from 'bcrypt'

const User = model('User', UserSchema);

export const addNewUser: RequestHandler = (req, res) => {
    const credentials = basicAuth(req.headers.authorization  as string);
    const username = credentials[0];
    bcrypt.hash(credentials[1],SALT_ROUNDS,(err, hash) => {
        req.body.username = username;
        req.body.password = hash;

        let newUser = new User(req.body);
        newUser.save((err, user) => {
            if (err) {
                res.send(err);
                return;
            }
            res.json(user);
        });
    });
}


export const getUsers: RequestHandler = (req, res) => {
    User.find({}, (err, user) => {
        if (err) {
            res.send(err);
            return;
        }
        res.json(user);
    });
}

export const getUserWithID: RequestHandler = (req, res) => {
    User.findById(req.params.userID, null, null, (err, user) => {
        if (err) {
            res.send(err);
            return;
        }
        res.json(user);
    });
}

export const updateUser: RequestHandler = (req, res) => {
    User.findOneAndUpdate(
        { _id: req.params.userID},
        req.body,
        { new: true, useFindAndModify: false },
        (err, user) => {
            if (err) {
                res.send(err);
                return;
            }
            res.json(user);
        }
    );
}

export const deleteUser: RequestHandler = (req, res) => {
    User.remove({ _id: req.params.userID}, err => {
        if (err) {
            res.send(err);
        }
        res.json({ message: 'Successfuly deleted user'});
    });
}

export const loginUser: RequestHandler =  (req, res,next: NextFunction) => {
    const credentials = basicAuth(req.headers.authorization  as string);
    const username = credentials[0];

    User.find({username: username}, (err, user) => {
            if (user.length==0) {
                res.status(404).send("User not found");
                return;
            }
            bcrypt.compare(credentials[1],user[0].password,(err, areTheSame) => {
                if (err) {
                    res.send(err);
                    return;
                }
                if (!areTheSame) {
                    res.status(404).send("User not found");
                    return;
                }

                res.locals = {...res.locals, username: user[0].username}
                next()
            });
        }
    );


}

export const updatePassword: RequestHandler =  (req, res,next: NextFunction) => {
    const credentials = basicAuth(req.headers.authorization  as string);
    const username = credentials[0];
    bcrypt.hash(credentials[1],SALT_ROUNDS,(err, hash) => {
        if (err) {
            console.error(err)
            return;
        }
        User.findOneAndUpdate({username: username},
            {password: hash},
            { new: true },
            (err, user) => {
                if (!user) {
                    res.status(404).send("User not found");
                    return;
                }

                res.locals = {...res.locals, username: user.username}
                next()
            }
        );
    });


}
