import mongoose from 'mongoose';
import cron from 'cron';
import slugify from 'slugify';
import app from './app.js';
import * as AlbumController from './controllers/albumController.js';
import { asyncTimeout, retry } from './utils.js';
import { writeAlbumDataToFile, writePlaylistDataToFile, writeLastUpdateDataToFile } from './controllers/apiController.js';

// handling uncaught exceptions - nehandlovane errors (bugs) v sync kode (napr. console.log neexistujucej premennej) - vtedy netreba cakat na ukoncenie servera
process.on('uncaughtException', err => {
  console.log(err);
  process.exit(1);
});

const DB = process.env.DATABASE.replace('<db_password>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB).then(con => console.log('DB connection successful'));

const port = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';
const server = app.listen(port, host, () => console.log(`Listening to requests on port ${port}`));

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



// await AlbumController.getAndSaveAlbums().catch(err => console.log(err));
// await AlbumController.getAndSaveAlbums(`${process.env.PLAYLIST_VYPOCUT}`)//.catch(err => console.log(err)); // vypocut
// await AlbumController.getAndSaveAlbums(`${PLAYLIST_2021}`).catch(err => console.log(err)); // 2021
// const a = await AlbumController.getAlbumsFromDb().catch(err => console.log(err));
// console.log(a[0]);


// various APIs testing
// console.log(await AlbumController.fetchSpotifyData('https://api.spotify.com/v1/me/top/tracks').catch(err => console.log(err)));
// console.log(await AlbumController.fetchSpotifyData('https://api.spotify.com/v1/albums/4datec5uCyeyuvqYkOj55F').catch(err => console.log(err)));
// console.log(await AlbumController.getStreamingLinks('4x0Ctds3wypaoiUsfG6SSh'));
// await AlbumController.searchWeb();


// error handling testing
// const a = await retry(AlbumController.fetchSpotifyData, 'fetchSpotifyData', {}, 'https://api.spotify.com/v1/albums/7ngtNHKrtpN37n5Sr2lwQV 1')//.catch(err => console.log(err));
// const a = await AlbumController.fetchSpotifyData('https://api.spotify.com/v1/albums/754R5T7XTstZinW8Srr2Zi').catch(err => console.log(err));
// console.log(a);
// await AlbumController.fetchSpotifyData('https://api.spotify.com/v1/albums/7ngtNHKrtpN37n5Sr2lwQV x');

// write data to file
// await writeAlbumDataToFile();
// await writePlaylistDataToFile();
// await writeLastUpdateDataToFile();

// other
// console.log(slugify(`I'm totally fine with it 👍 don't give a fuck anymore 👍`, { lower: true, strict: true }));
// console.log(slugify(`LIVE IN PARIS 28.05.1975`, { lower: true, strict: true }));