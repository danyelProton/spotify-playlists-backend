import express, { json } from 'express';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import * as TokenController from './controllers/tokenController.js';
import * as ApiController from './controllers/apiController.js';
import { AppError, errorHandler } from './controllers/errorController.js';

const app = express();

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
app.get('/api/updates', ApiController.getLastUpdateFromDb);
app.all('/{*any}', (req, res, next) => {
  throw new AppError(404, `Can't find ${req.originalUrl} on this server`);
});
app.use(errorHandler);

export default app;