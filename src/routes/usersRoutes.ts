import { Application } from 'express';
import { addNewUser,
        getUsers,
        getUserWithID,
        updateUser,
        deleteUser
} from '../services/userService';

const routes = (app: Application) => {
    app.route('/users')
        .get((req, res, next) => {
            // middleware
            console.log(`Request from: ${req.originalUrl}`)
            console.log(`Request type: ${req.method}`)
            next();
        }, getUsers)
        
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
