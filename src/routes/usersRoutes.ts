import { Application } from 'express';
import { loggerMiddleware } from '../middlewares/loggerMiddleware';
import {
    addNewUser,
    getUsers,
    getUserWithID,
    updateUser,
    deleteUser,
    loginUser
} from '../services/userService';

const routes = (app: Application) => {
    app.route('/users')
        .get(loggerMiddleware, getUsers)
        
        // Post endpoint
        .post(addNewUser);

    app.route('/users/:userID')
        // get a specific user
        .get(getUserWithID)

        // updating a specific user
        .put(updateUser)

        // deleting a specific user
        .delete(deleteUser);


    app.route("/login/users")

        // User is trying to log in.
        .post(loginUser)


}

export default routes;
