import { RequestHandler } from "express";
import { model } from 'mongoose';
import { UserSchema } from '../models/userModel';

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
        res.json({ message: 'successfuly deleted user'});
    });
}
