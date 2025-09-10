import express, { json } from 'express';
// import mongoose from 'mongoose'; // for AWS cron serverless function - DB connect must be in app.js
// import serverless from 'serverless-http'; // for AWS cron serverless function
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import * as TokenController from './controllers/tokenController.js';
import * as ApiController from './controllers/apiController.js';
import { AppError, errorHandler } from './controllers/errorController.js';

const app = express();

//// for AWS cron serverless function - DB connect must be in app.js
// const DB = process.env.DATABASE.replace('<db_password>', process.env.DATABASE_PASSWORD);
// mongoose.connect(DB).then(con => console.log('DB connection successful'));

app.use(helmet());

// dopln url ked bude frontend
app.use(cors({
  // origin: 'https://www.example.com'
}));

app.use(express.json({ limit: '10kb' }));
app.use(compression());

app.get('/spotifyserver/login', TokenController.loginHandler);
app.get('/spotifyserver/callback', TokenController.callbackHandler);
app.get('/api/albums', ApiController.getAlbumDataFromFile);
app.get('/api/playlists', ApiController.getPlaylistDataFromFile);
app.get('/api/updates', ApiController.getLastUpdateDataFromFile);
// app.get('/api/cron', ApiController.runCronJob); // used only for AWS serverless function
app.all('/{*any}', (req, res, next) => {
  throw new AppError(404, `Can't find ${req.originalUrl} on this server`);
});
app.use(errorHandler);

export default app;
// export default serverless(app); // for AWS cron serverless function