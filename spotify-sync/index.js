import mongoose from 'mongoose'; // for AWS cron serverless function - DB connect must be in app.js
import * as AlbumController from './albumController.js';
import { asyncTimeout, retry, getAlbumsFromDb, getPlaylistsFromDb, writeAlbumDataToFile, writePlaylistDataToFile, writeLastUpdateDataToFile } from '../shared/utils.js';

const DB = process.env.DATABASE.replace('<db_password>', process.env.DATABASE_PASSWORD);
// await mongoose.connect(DB).then(() => console.log('DB connection successful'));

export const handler = async () => {
  await mongoose.connect(DB).then(() => console.log('DB connection successful'));
  await AlbumController.getAndSaveAlbums(`${process.env.PLAYLIST_VYPOCUT}`);
  await mongoose.disconnect(DB).then(() => console.log('DB connection closed'));
};

if (process.env.NODE_ENV === 'development') {
  // handler();
}


//// main function
// await AlbumController.getAndSaveAlbums().catch(err => console.log(err));

// await AlbumController.getAndSaveAlbums(`${process.env.PLAYLIST_VYPOCUT}`)//.catch(err => console.log(err)); // vypocut
// console.log(await AlbumController.getAndSaveAlbums(`${process.env.PLAYLIST_VYPOCUT}`))//.catch(err => console.log(err)); // vypocut
// await AlbumController.getAndSaveAlbums(`${PLAYLIST_2021}`).catch(err => console.log(err)); // 2021
// const a = await AlbumController.getAlbumsFromDb().catch(err => console.log(err));
// const a = await AlbumController.getAlbumsFromDb({ active: true }, { summary: 0, 'playlists.spotifyId': 0 }).catch(err => console.log(err));
// console.log(a[0]);


//// various APIs testing
// console.log(await AlbumController.fetchSpotifyData('https://api.spotify.com/v1/me/top/tracks').catch(err => console.log(err)));
// console.log(await AlbumController.fetchSpotifyData('https://api.spotify.com/v1/albums/4datec5uCyeyuvqYkOj55F').catch(err => console.log(err)));
// console.log(await AlbumController.getStreamingLinks('4x0Ctds3wypaoiUsfG6SSh'));
// await AlbumController.searchWeb();


//// error handling testing
// const a = await retry(AlbumController.fetchSpotifyData, 'fetchSpotifyData', {}, 'https://api.spotify.com/v1/albums/7ngtNHKrtpN37n5Sr2lwQV 1')//.catch(err => console.log(err));
// const a = await AlbumController.fetchSpotifyData('https://api.spotify.com/v1/albums/754R5T7XTstZinW8Srr2Zi').catch(err => console.log(err));
// console.log(a);
// await AlbumController.fetchSpotifyData('https://api.spotify.com/v1/albums/7ngtNHKrtpN37n5Sr2lwQV x');

//// write data to file
// await writeAlbumDataToFile();
// await writePlaylistDataToFile();
// await writeLastUpdateDataToFile();

//// other
// console.log(slugify(`I'm totally fine with it 👍 don't give a fuck anymore 👍`, { lower: true, strict: true }));
// console.log(slugify(`LIVE IN PARIS 28.05.1975`, { lower: true, strict: true }));