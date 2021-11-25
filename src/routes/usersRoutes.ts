import { Application } from 'express';
import { loggerMiddleware } from '../middlewares/loggerMiddleware';
import { addNewUser,
        getUsers,
        getUserWithID,
        updateUser,
        deleteUser
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
}

export default routes;
