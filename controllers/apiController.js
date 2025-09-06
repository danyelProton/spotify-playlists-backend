import { readFile, writeFile } from 'node:fs/promises';
import Update from '../models/updateModel.js';
import { AppError } from '../controllers/errorController.js';
import { getAlbumsFromDb, getPlaylistsFromDb } from './albumController.js';


// get albums data from db and write to json file
export const writeAlbumDataToFile = async () => {
  const albums = await getAlbumsFromDb({ active: true });
  // console.log(albums);
  await writeFile('./data/albums.json', JSON.stringify(albums));
};




// get playlist data from db and write to json file
export const writePlaylistDataToFile = async () => {
  const playlists = await getPlaylistsFromDb({ active: true });
  // console.log(playlists);
  await writeFile('./data/playlists.json', JSON.stringify(playlists));
};




// get updates data from db and write to json file
export const writeLastUpdateDataToFile = async () => {
  const lastUpdate = await Update.find();
  // console.log(lastUpdate);
  await writeFile('./data/lastUpdate.json', JSON.stringify(lastUpdate[0].lastUpdated));
};




// albums route controller
export const getAlbumDataFromFile = async (req, res, next) => {
  const albumData = await readFile('./data/albums.json', 'utf-8');
  if (!albumData) throw new AppError(404, 'No albums found.');

  res.status(200).json({
    status: 'success',
    data: albumData
  });
};




// playlists route controller
export const getPlaylistDataFromFile = async (req, res, next) => {
  const playlistData = await readFile('./data/playlists.json', 'utf-8');
  if (!playlistData) throw new AppError(404, 'No playlists found.');

  res.status(200).json({
    status: 'success',
    data: playlistData
  });
};




// updates route controller
export const getLastUpdateDataFromFile = async (req, res, next) => {
  const lastUpdate = readFile('./data/lastUpdate.json', 'utf-8');
  if (!lastUpdate) throw new AppError(404, 'No updates found.');

  res.status(200).json({
    status: 'success',
    data: lastUpdate
  });
};