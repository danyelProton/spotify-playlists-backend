import { readFile } from 'node:fs/promises';
import Update from '../shared/updateModel.js';
import { AppError } from '../shared/errorController.js';


//// ROUTE CONTROLLERS -------------------------------------------------------------------
// albums route controller
export const getAlbumDataFromFile = async (req, res, next) => {
  // const albumData = await readFile('./data/albums.json', 'utf-8');
  const albumData = process.env.NODE_ENV === 'development' ? await readFile('./data/albums.json', 'utf-8') : JSON.stringify(await getAlbumsFromDb({ active: true }, { createdAt: 0, genresSpotify: 0, genresWeb: 0, __v: 0, 'playlists.spotifyId': 0 }));
  if (!albumData) throw new AppError(404, 'No albums found.');

  res.status(200).json({
    status: 'success',
    data: albumData
  });
};



// playlists route controller
export const getPlaylistDataFromFile = async (req, res, next) => {
  const playlistData = process.env.NODE_ENV === 'development' ? await readFile('./data/playlists.json', 'utf-8') : JSON.stringify(await getPlaylistsFromDb({ active: true }, { __v: 0, spotifyId: 0 }));
  if (!playlistData) throw new AppError(404, 'No playlists found.');

  res.status(200).json({
    status: 'success',
    data: playlistData
  });
};



// updates route controller
export const getLastUpdateDataFromFile = async (req, res, next) => {
  const lastUpdate = process.env.NODE_ENV === 'development' ? await readFile('./data/lastUpdate.json', 'utf-8') : JSON.stringify(await Update.find());
  if (!lastUpdate) throw new AppError(404, 'No updates found.');

  res.status(200).json({
    status: 'success',
    data: lastUpdate
  });
};
