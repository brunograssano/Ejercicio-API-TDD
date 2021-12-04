import { Application } from 'express';
import { loggerMiddleware } from '../middlewares/loggerMiddleware';
import {
    addNewUser,
    getUsers,
    getUserWithID,
    updateUser,
    deleteUser,
    loginUser,
    updatePassword, getContacts, deleteContact, searchUsers, getPhotoFromUser, forgotPassword
} from '../services/userService';
import {createNewSession, createSessionToRecoverPassword, jwtMiddleware} from "../middlewares/jwtMiddleware";

const routes = (app: Application) => {

    app.route('/users')
        //tests
        .get(getUsers)
        
        // sign up user
        .post(addNewUser,createNewSession);

    app.route('/search/users')
        // can search for users
        .get(searchUsers)

    app.route('/resources/photo/:username')
        // can get the photo from a user
        .get(getPhotoFromUser)

    app.route('/manage/users/:userID')
        // get a specific user
        .get(jwtMiddleware, getUserWithID)

        // updating a specific user
        .patch(jwtMiddleware,updateUser)

        // deleting a specific user
        .delete(jwtMiddleware,deleteUser)

    app.route('/manage/contacts/:userID')
        // a User can see its contacts
        .get(jwtMiddleware,getContacts)

        // a User can delete a contact
        .delete(jwtMiddleware,deleteContact)


    app.route("/login/users")

        // User is trying to log in.
        .post(loginUser,createNewSession)

        // User updates the password.
        .patch(jwtMiddleware,updatePassword,createNewSession)

    app.route("/login/reset/password")
        // User forgot password.
        .post(forgotPassword,createSessionToRecoverPassword)


}

export default routes;
