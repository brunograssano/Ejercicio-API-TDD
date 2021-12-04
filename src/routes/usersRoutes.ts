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
    checkIfEmailIsValidated
} from '../services/userService';
import {
    createNewSession,
    createSessionToRecoverPassword,
    jwtMiddleware,
    createValidateEmailSession
} from "../middlewares/jwtMiddleware";

const routes = (app: Application) => {

    app.route('/users')
        //tests
        .get(getUsers)
        
        // sign up user
        .post(addNewUser,createValidateEmailSession);

    app.route('/search/users')
        // can search for users
        .get(searchUsers)

    app.route('/resources/photo/:username')
        // can get the photo from a user
        .get(getPhotoFromUser)

    app.route('/manage/users/:userID')
        // get a specific user
        .get(jwtMiddleware, checkIfEmailIsValidated, getUserWithID)

        // updating a specific user
        .patch(jwtMiddleware,checkIfEmailIsValidated,updateUser)

        // deleting a specific user
        .delete(jwtMiddleware,checkIfEmailIsValidated,deleteUser)

    app.route('/manage/contacts/:userID')
        // a User can see its contacts
        .get(jwtMiddleware,checkIfEmailIsValidated,getContacts)

        // a User can delete a contact
        .delete(jwtMiddleware,checkIfEmailIsValidated,deleteContact)


    app.route("/login/users")

        // User is trying to log in.
        .post(checkIfEmailIsValidated,loginUser,createNewSession)

        // User updates the password.
        .patch(jwtMiddleware,checkIfEmailIsValidated,updatePassword,createNewSession)

    app.route("/login/reset/password")
        // User forgot password.
        .post(checkIfEmailIsValidated,forgotPassword,createSessionToRecoverPassword)

    app.route("/validate/email")
        // To validate the email of a user.
        .post(jwtMiddleware,validateEmail)

}

export default routes;
