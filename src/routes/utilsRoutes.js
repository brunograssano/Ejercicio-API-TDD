import { getHealthInfo
} from '../services/healthService';

const routes = (app) => {
    app.route('/utils/health')
        .get((req,res, next) => {
            // middleware
            console.log(`Request from: ${req.originalUrl}`)
            console.log(`Request type: ${req.method}`)
            next();
        }, getHealthInfo)        
}

export default routes;
