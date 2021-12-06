import {RequestHandler} from "express";
import {User} from "./userService";
import {Callback} from "mongoose";

const printMongooseError: Callback = (error) => {
    if(error){
        console.log(error)
    }
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

        User.find({"username": {"$in": user?.contacts.name} },{_id:0,password:0,__v:0},null,(errorContacts, contacts) => {
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

export const checkContactInviteExists: RequestHandler = (request, response, next) => {
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

    User.exists({username:contact},(error,exists)=>{
        printMongooseError(error,null)
        if (!exists){
            response.status(400).send({message:"User doesn't exists"})
            return;
        }
        User.findOne({username: sender}, {contacts:1},null,
            (error,user) => {
                printMongooseError(error,null);
                if(user && !user.contacts.name.includes(contact)){
                    next()
                    return;
                }
                response.status(400).send({message:"Already a contact"})
            });
    })
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