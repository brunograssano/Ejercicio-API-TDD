import { RequestHandler } from "express";
import { model } from 'mongoose';
import { UserSchema } from '../models/userModel';
import {basicAuth} from "./authService";

const User = model('User', UserSchema);

export const addNewUser: RequestHandler = (req, res) => {
    let newUser = new User(req.body);

    newUser.save((err, user) => {
        if (err) {
            res.send(err);
        }
        res.json(user);
    });
}

export const getUsers: RequestHandler = (req, res) => {
    User.find({}, (err, user) => {
        if (err) {
            res.send(err);
        }
        res.json(user);
    });
}

export const getUserWithID: RequestHandler = (req, res) => {
    User.findById(req.params.userID, null, null, (err, user) => {
        if (err) {
            res.send(err);
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

export const loginUser: RequestHandler =  (req, res) => {
    const credentials = basicAuth(req.headers.authorization  as string);
    const username = credentials[0];
    const pass = credentials[1];
    User.find({username: username, password: pass}, (err, user) => {
            if (user.length==0) {
                res.status(404).send("User not found");
            }
            res.json(user);//todo token
        }
    );

}

export const updatePassword: RequestHandler =  (req, res) => {
    const credentials = basicAuth(req.headers.authorization  as string);
    const username = credentials[0];
    const pass = credentials[1];
    User.findOneAndUpdate({username: username},
        {password: pass},
        { new: true },
        (err, user) => {
            if (!user) {
                res.status(404).send("User not found");
            }
            res.json(user);//todo token
        }
    );

}
