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

const routes = (app: Application) => {

    app.route('/users')
        .get(loggerMiddleware, getUsers)
        
        // Post endpoint
        .post(loggerMiddleware,addNewUser);

    app.route('/manage/users/:userID')
        // get a specific user
        .get(loggerMiddleware, getUserWithID)

        // updating a specific user
        .patch(loggerMiddleware,updateUser)

        // deleting a specific user
        .delete(loggerMiddleware,deleteUser);

    app.route("/login/users")

        // User is trying to log in.
        .post(loggerMiddleware,loginUser)

        // User forgot password.
        .patch(loggerMiddleware,updatePassword);


}

export default routes;
