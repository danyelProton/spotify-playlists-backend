import express, { json } from 'express';
import mongoose from 'mongoose'; // for AWS cron serverless function - DB connect must be in app.js
import * as TokenController from './tokenController.js';
import { AppError, errorHandler } from '../../shared/errorController.js';

const app = express();

const DB = process.env.DATABASE.replace('<db_password>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB).then(con => console.log('DB connection successful'));

app.get('/spotifyserver/login', TokenController.loginHandler);
app.get('/spotifyserver/callback', TokenController.callbackHandler);
app.all('/{*any}', (req, res, next) => {
  throw new AppError(404, `Can't find ${req.originalUrl} on this server`);
});
app.use(errorHandler);

const port = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';
const server = app.listen(port, host, () => console.log(`Listening to requests on port ${port}`));