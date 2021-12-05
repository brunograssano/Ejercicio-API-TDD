import {RequestHandler} from "express";
import {basicAuth} from "./authService";
import {User} from "./userService";

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
