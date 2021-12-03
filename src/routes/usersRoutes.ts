import { Application } from 'express';
import { loggerMiddleware } from '../middlewares/loggerMiddleware';
import {
    addNewUser,
    getUsers,
    getUserWithID,
    updateUser,
    deleteUser,
    loginUser,
    updatePassword, getContacts, deleteContact, searchUsers
} from '../services/userService';
import {createNewSession, jwtMiddleware} from "../middlewares/jwtMiddleware";

const routes = (app: Application) => {

    app.route('/users')
        //tests
        .get(getUsers)
        
        // sign up user
        .post(addNewUser,createNewSession);

    app.route('/search/users')
        // can search for users
        .get(searchUsers)

    app.route('/manage/users/:userID')
        // get a specific user
        .get(jwtMiddleware, getUserWithID)

        // updating a specific user
        .patch(jwtMiddleware,updateUser)

        // deleting a specific user
        .delete(jwtMiddleware,deleteUser); // otras funciones que se encargan de la respuesta

    app.route('/manage/contacts/:userID')
        // a User can see its contacts
        .get(jwtMiddleware,getContacts)

        // a User can delete a contact
        .delete(jwtMiddleware,deleteContact) // separar la accion, que se encapsule mas, recibe y devuelve objetos


    app.route("/login/users")

        // User is trying to log in.
        .post(loginUser,createNewSession)

        // User forgot password.
        .patch(updatePassword,createNewSession);


}

export default routes;
