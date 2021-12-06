import { Application } from 'express';
import {
    getUsers,
    getUserWithID,
    searchUsers,
    getPhotoFromUser,
} from '../services/userService';

import {
    createNewSession,
    createSessionToRecoverPassword,
    jwtMiddleware,
    createValidateEmailSession
} from "../middlewares/jwtMiddleware";

import {
    checkIfEmailIsValidatedById,
    checkIfEmailIsValidatedByUsername,
    checkIfEmailIsValidatedByUsernameInHeader,
    validateEmail
} from "../services/emailValidation";

import {
    acceptContact,
    checkContactInviteExists,
    checkIfPreviouslyInvited,
    checkIsAValidContact,
    deleteContact,
    getContacts,
    inviteContact,
    sendMessageToContact
} from "../services/contactManagement";

import {
    addNewUser, addPhotoToUser,
    changeMainEmail,
    createPhotoUser,
    deletePhotoUser,
    deleteUser,
    forgotPassword,
    loginUser,
    updatePassword,
    updateUser
} from "../services/userAccountManagment";

const routes = (app: Application) => {

    app.route('/users')
        //tests
        .get(getUsers)
        
        // sign up user
        .post(addNewUser,
            createPhotoUser,
            createValidateEmailSession);

    app.route('/search/users')
        // can search for users
        .get(searchUsers)

    app.route('/resources/photo/:username')
        // can change the photo from a user
        .patch(jwtMiddleware,addPhotoToUser)
        // can get the photo from a user
        .get(getPhotoFromUser)

    app.route('/update/main/email')
        // The user can change the main email, it must be validated
        .patch(jwtMiddleware,
            changeMainEmail,
            createValidateEmailSession)

    app.route('/manage/users/:userID')
        // get a specific user
        .get(jwtMiddleware,
            checkIfEmailIsValidatedById,
            getUserWithID)

        // updating a specific user
        .patch(jwtMiddleware,
            checkIfEmailIsValidatedById,
            updateUser)

        // deleting a specific user
        .delete(jwtMiddleware,
            checkIfEmailIsValidatedById,
            deletePhotoUser,
            deleteUser)

    app.route('/manage/contacts/:userID')
        // a User can see its contacts
        .get(jwtMiddleware,
            checkIfEmailIsValidatedById,
            getContacts)

        // a User can delete a contact
        .delete(jwtMiddleware,
            checkIfEmailIsValidatedById,
            deleteContact)

    app.route("/invite/contact")
        // To validate the email of a user.
        .post(jwtMiddleware,
            checkIfEmailIsValidatedById,
            checkIsAValidContact,
            checkIfPreviouslyInvited,
            inviteContact,
            sendMessageToContact)

    app.route("/accept/contact")
        // To validate the email of a user.
        .post(jwtMiddleware,
            checkIfEmailIsValidatedById,
            checkIsAValidContact,
            checkContactInviteExists,
            acceptContact)

    app.route("/login/users")

        // User is trying to log in.
        .post(loginUser,
            checkIfEmailIsValidatedByUsernameInHeader,
            createNewSession)

        // User updates the password.
        .patch(jwtMiddleware,
            checkIfEmailIsValidatedById,
            updatePassword,
            createNewSession)

    app.route("/login/reset/password")
        // User forgot password.
        .post(checkIfEmailIsValidatedByUsername,
            forgotPassword,
            createSessionToRecoverPassword)

    app.route("/validate/email")
        // To validate the email of a user.
        .post(jwtMiddleware,
            validateEmail)

}

export default routes;
