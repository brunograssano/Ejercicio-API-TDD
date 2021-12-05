import { Application } from 'express';
import {
    addNewUser,
    getUsers,
    getUserWithID,
    updateUser,
    deleteUser,
    loginUser,
    updatePassword,
    getContacts,
    deleteContact,
    searchUsers,
    getPhotoFromUser,
    forgotPassword,
    validateEmail,
    checkIfEmailIsValidatedById,
    checkIfEmailIsValidatedByUsername,
    checkIfEmailIsValidatedByUsernameInHeader,
    inviteContact,
    acceptContact,
    sendMessageToContact,
    checkContactExists,
    checkIfPreviouslyInvited,
    checkIsAValidContact
} from '../services/userService';
import {
    createNewSession,
    createSessionToRecoverPassword,
    jwtMiddleware,
    createValidateEmailSession
} from "../middlewares/jwtMiddleware";
import {loggerMiddleware} from "../middlewares/loggerMiddleware";

const routes = (app: Application) => {

    app.route('/users')
        //tests
        .get(getUsers)
        
        // sign up user
        .post(addNewUser,
            createValidateEmailSession);

    app.route('/search/users')
        // can search for users
        .get(searchUsers)

    app.route('/resources/photo/:username')
        // can get the photo from a user
        .get(getPhotoFromUser)

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
            checkContactExists,
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
