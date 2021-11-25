import { Application } from 'express';
import { getHealthInfo
} from '../services/healthService';

const routes = (app: Application) => {
    app.route('/utils/health')
        .get((req, res, next) => {
            // middleware
            console.log(`Request from: ${req.originalUrl}`)
            console.log(`Request type: ${req.method}`)
            next();
        }, getHealthInfo)        
}

export default routes;
