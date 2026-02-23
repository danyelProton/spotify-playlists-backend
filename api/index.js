import express, { json } from 'express';
import serverless from 'serverless-http';
import mongoose from 'mongoose';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import * as ApiController from './apiController.js';
import { AppError, errorHandler } from '../shared/errorController.js';

// handling uncaught exceptions - nehandlovane errors (bugs) v sync kode (napr. console.log neexistujucej premennej) - vtedy netreba cakat na ukoncenie servera
process.on('uncaughtException', err => {
  console.log(err);
  process.exit(1);
});

const DB = process.env.DATABASE.replace('<db_password>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB).then(con => console.log('DB connection successful'));

const app = express();

app.use(helmet());

// dopln url ked bude frontend
app.use(cors({
  // origin: 'https://www.example.com'
}));

app.use(express.json({ limit: '10kb' }));
app.use(compression());


app.get('/favicon.ico', (req, res) => res.status(204).end());
app.get('/albums', ApiController.getAlbumDataFromFile);
app.get('/playlists', ApiController.getPlaylistDataFromFile);
app.get('/updates', ApiController.getLastUpdateDataFromFile);
// app.all('/{*any}', (req, res, next) => {
//   throw new AppError(404, `Can't find ${req.originalUrl} on this server`);
// });
app.all("*", (req, res) => res.send(`path seen: ${req.path}`));
app.use(errorHandler);


const port = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';
// const server = app.listen(port, host, () => console.log(`Listening to requests on port ${port}`));


// handling unhandled promise rejections - nehandlovane errors v async kode - napr. chyba pri connectnuti databazy; exitneme process, ale az vtedy ked server ukoncil vsetky pending alebo prebiehajuce tasky (process.exit je executed az ked je server closed)
process.on('unhandledRejection', err => {
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});

// handlovanie SIGTERM - signal, ktory posielaju niektore hostingy, aby ukoncili proces - napr. kde sa deployuje novy kod; nepouzivame process.exit(), lebo uz samotny SIGTERM sposobi ukoncenie aplikacie
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully.');
  server.close(() => {
    console.log('Process terminated.');
  })
});


export default serverless(app);