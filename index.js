import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';


import * as dotenv from "dotenv";
dotenv.config({ path: __dirname+'/.env' });
const SERVER_API_PORT = process.env.SERVER_API_PORT;
const SERVER_DB_HOST = process.env.SERVER_DB_HOST;


import { Router } from 'express';
import usersRoutes from './src/routes/usersRoutes';
import utilsRoutes from './src/routes/utilsRoutes';

const app = express();

// mongoose connection
mongoose.Promise = global.Promise;
mongoose.connect(SERVER_DB_HOST, { useNewUrlParser: true, useUnifiedTopology: true} );

// bodyparser setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); 

usersRoutes(app);
utilsRoutes(app);

// serving static files
app.use(express.static('public'));

app.get('/', (req, res) =>
    res.send(`Node and express server running on port ${SERVER_API_PORT}`)
);

app.listen(SERVER_API_PORT, () => 
    console.log(`Your server is running on port ${SERVER_API_PORT}`)
);