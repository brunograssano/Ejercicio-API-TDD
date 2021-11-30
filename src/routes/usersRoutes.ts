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
        //tests
        .get(getUsers)
        
        // sign up user
        .post(addNewUser);

    app.route('/manage/users/:userID')
        // get a specific user
        .get(loggerMiddleware, getUserWithID)

        // updating a specific user
        .patch(loggerMiddleware,updateUser)

        // deleting a specific user
        .delete(loggerMiddleware,deleteUser);

    app.route("/login/users")

        // User is trying to log in.
        .post(loginUser)

        // User forgot password.
        .patch(updatePassword);


}

export default routes;
