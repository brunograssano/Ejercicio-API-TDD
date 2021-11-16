import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';


import * as dotenv from "dotenv";
dotenv.config({ path: __dirname+'/.env' });

import { Router } from 'express';
import usersRoutes from './src/routes/usersRoutes';
import utilsRoutes from './src/routes/utilsRoutes';

const app = express();
const PORT = process.env.SERVER_API_PORT;

// mongoose connection
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/rest-exercise-db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// bodyparser setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); 

usersRoutes(app);
utilsRoutes(app);

// serving static files
app.use(express.static('public'));

app.get('/', (req, res) =>
    res.send(`Node and express server running on port ${PORT}`)
);

app.listen(PORT, () => 
    console.log(`Your server is running on port ${PORT}`)
);