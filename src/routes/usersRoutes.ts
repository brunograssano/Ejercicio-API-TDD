import { Application } from 'express';
import { loggerMiddleware } from '../middlewares/loggerMiddleware';
import {
    addNewUser,
    getUsers,
    getUserWithID,
    updateUser,
    deleteUser,
    loginUser,
    updatePassword
} from '../services/userService';
import {createNewSession, jwtMiddleware} from "../middlewares/jwtMiddleware";

const routes = (app: Application) => {

    app.route('/users')
        //tests
        .get(getUsers)
        
        // sign up user
        .post(addNewUser);

    app.route('/manage/users/:userID')
        // get a specific user
        .get(jwtMiddleware, getUserWithID)

        // updating a specific user
        .patch(jwtMiddleware,updateUser)

        // deleting a specific user
        .delete(jwtMiddleware,deleteUser);

    app.route("/login/users")

        // User is trying to log in.
        .post(loginUser,createNewSession)

        // User forgot password.
        .patch(updatePassword,createNewSession);


}

export default routes;
