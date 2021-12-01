import { Application } from 'express';
import { loggerMiddleware } from '../middlewares/loggerMiddleware';
import {
    addNewUser,
    getUsers,
    getUserWithID,
    updateUser,
    deleteUser,
    loginUser,
    updatePassword, getContacts, deleteContact
} from '../services/userService';
import {createNewSession, jwtMiddleware} from "../middlewares/jwtMiddleware";

const routes = (app: Application) => {

    app.route('/users')
        //tests
        .get(getUsers)
        
        // sign up user
        .post(addNewUser,createNewSession);

    app.route('/manage/users/:userID')
        // get a specific user
        .get(jwtMiddleware, getUserWithID)

        // updating a specific user
        .patch(jwtMiddleware,updateUser)

        // deleting a specific user
        .delete(jwtMiddleware,deleteUser);

    app.route('/manage/contacts/:userID')
        // a User can see its contacts
        .get(jwtMiddleware,getContacts)

        // a User can delete a contact
        .delete(jwtMiddleware,deleteContact)


    app.route("/login/users")

        // User is trying to log in.
        .post(loginUser,createNewSession)

        // User forgot password.
        .patch(updatePassword,createNewSession);


}

export default routes;
