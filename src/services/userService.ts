import {NextFunction, RequestHandler} from "express";
import {Callback, model} from 'mongoose';
import {UserSchema, UserView} from '../models/userModel';
import {basicAuth, SALT_ROUNDS} from "./authService";
import bcrypt from 'bcrypt'
import {getSearchQuery} from "./queryServices";
import {getSignUpData, getUpdatedDataFromUser} from "./bodyCleaner";

const User = model('User', UserSchema);



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

export const validateEmail: RequestHandler = (request, response) => {
    User.findByIdAndUpdate(response.locals.session.id, {"email.validated":true},null,
        (error, user) => {
            if (error) {
                response.send(error);
                return;
            }

            response.json({message:"Email validated successfully, please login to continue"});
        });
}

const checkIfEmailIsValidated: RequestHandler = (request, response, next) => {
    User.findOne(response.locals.query, {email: 1}, null,
        (error, user) => {
            if (error) {
                response.send(error);
                return;
            }
            if (!user) {
                response.status(400).send({message: "No user found"});
                return;
            } else if (!user.email.validated) {
                response.status(400).send({message: "Validate the email to continue"});
                return;
            }

            next();
        });
}

export const checkIfEmailIsValidatedById: RequestHandler = (request, response,next) => {
    response.locals = {
        ...response.locals,
        query: {_id:response.locals.session.id}
    }
    checkIfEmailIsValidated(request,response,next)
}

export const checkIfEmailIsValidatedByUsername: RequestHandler = (request, response,next) => {
    response.locals = {
        ...response.locals,
        query: {username:request.body.username}
    }
    checkIfEmailIsValidated(request,response,next)
}

export const checkIfEmailIsValidatedByUsernameInHeader: RequestHandler = (request, response,next) => {
    const credentials = basicAuth(request.headers.authorization  as string);
    const username = credentials[0];
    response.locals = {
        ...response.locals,
        query: {username:username}
    }
    checkIfEmailIsValidated(request,response,next)
}

const printMongooseError: Callback = (error) => {
    if(error){
        console.log(error)
    }
}

function addToPendingList(contact : string, sender : string) {
    User.updateOne({username: contact}, {$push: {pendingContacts: sender}},null,printMongooseError);
}

function removeFromPendingList(contact : string, sender : string) {
    User.updateOne({username: contact}, {$pull: {pendingContacts: sender}},null, printMongooseError);
}

function addToContactList(sender : string, newContact : string) {
    User.updateOne({username: sender}, {$push: {"contacts.name": newContact}},null, printMongooseError);
}

export const inviteContact: RequestHandler = (request, response,next) => {
    let contact = request.body.contactUsername;
    let sender = response.locals.session.username;
    addToPendingList(contact, sender);
    next();
}

export const checkContactExists: RequestHandler = (request, response,next) => {
    let accepter = response.locals.session.username;
    let sender = request.body.contactUsername;
    User.findOne({username: accepter}, {pendingContacts:1},null,
        (error,user) => {
            printMongooseError(error,null);
            if(user && user.pendingContacts.includes(sender)){
                next()
                return;
            }
            response.status(400).send({message:"Contact invite doesn't exists."})
        });
}

export const checkIfPreviouslyInvited: RequestHandler = (request, response,next) => {
    let sender = response.locals.session.username;
    let contact = request.body.contactUsername;
    User.findOne({username: contact}, {pendingContacts:1},null,
        (error,user) => {
            printMongooseError(error,null);
            if(user && !user.pendingContacts.includes(sender)){
                next()
                return;
            }
            response.status(400).send({message:"Cannot invite again a contact"})
        });
}


export const checkIsAValidContact: RequestHandler = (request, response,next) => {
    let sender = response.locals.session.username;
    let contact = request.body.contactUsername;
    if (sender == contact){
        response.status(400).send({message:"Cannot invite yourself"})
        return;
    }
    next();
}

export const acceptContact: RequestHandler = (request, response) => {
    let accepter = response.locals.session.username;
    let sender = request.body.contactUsername;
    addToContactList(sender,accepter);
    removeFromPendingList(accepter, sender);
    response.json({message:"Contact accepted successfully."})
}

export const sendMessageToContact: RequestHandler = (request, response) => {
    let contact = request.body.contactUsername;
    let message = request.body.message;
    let sender = response.locals.session.username;
    console.log("DEBUG: Contact invitation sent to user: " + contact);
    console.log("DEBUG: Message: " + message);
    console.log("DEBUG: Sent from: " + sender);
    response.json({message:"Contact invite sent successfully."})
}