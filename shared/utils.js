import { writeFile } from 'node:fs/promises';
import Playlist from "./playlistModel.js";
import Album from "./albumModel.js";
import Update from "./updateModel.js";


// async "wait" function 
export const asyncTimeout = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};




// retry mechanism - use to wrap function calls in the main function
// args are arguments used when a certain function is called - so the function is called as originally intented
// attempt 0 is the initial function call
export const retry = async (fn, fnName, options = {}, ...args) => {
  const { maxAttempts = 5, delayMs = 1000 } = options; // object destructuring with default values - if not provided in the retry call
  let attempt = 0;

  while (attempt <= maxAttempts) {
    try {
      // console.log(`Executing attempt ${attempt}`);
      return await fn(...args);
    } catch (err) {
      const delay = delayMs * (2 ** attempt);

      if (attempt < maxAttempts) {
        console.log(`Error in '${fnName}' - ${err.message}. Retry attempt ${attempt + 1} with ${delay}ms delay.`);
        await asyncTimeout(delay);
      } else {
        console.log(`All attempts failed.`);
      }

    }
    attempt++;
  }
};




export const randomNumber = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};




//// GET DATABASE DATA -------------------------------------------------------------------
export const getPlaylistsFromDb = async (query = {}, projection = {}) => {
  return await Playlist.find(query, projection);
};


export const getAlbumsFromDb = async (query = {}, projection = {}) => {
  return await Album.find(query, projection);
};




//// GET DATA AND WRITE TO FILE -------------------------------------------------------------------
// get albums data from db and write to json file
export const writeAlbumDataToFile = async () => {
  const albums = await getAlbumsFromDb({ active: true }, { createdAt: 0, genresSpotify: 0, genresWeb: 0, __v: 0, 'playlists.spotifyId': 0 });
  // console.log(albums);
  await writeFile('../api/data/albums.json', JSON.stringify(albums));
};


// get playlist data from db and write to json file
export const writePlaylistDataToFile = async () => {
  const playlists = await getPlaylistsFromDb({ active: true }, { __v: 0, spotifyId: 0 });
  // console.log(playlists);
  await writeFile('../api/data/playlists.json', JSON.stringify(playlists));
};


// get updates data from db and write to json file
export const writeLastUpdateDataToFile = async () => {
  const lastUpdate = await Update.find();
  // console.log(lastUpdate);
  await writeFile('../api/data/lastUpdate.json', JSON.stringify(lastUpdate[0].lastUpdated));
};