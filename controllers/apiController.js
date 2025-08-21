import { readFile, writeFile } from 'node:fs/promises';
import Update from '../models/updateModel.js';
import { AppError } from '../controllers/errorController.js';
import { getAlbumsFromDb } from './albumController.js';

// get data from db and write to json file
export const writeAlbumDataToFile = async () => {
  const albums = await getAlbumsFromDb({ active: true });
  // console.log(albums);
  await writeFile('./data/data.json', JSON.stringify(albums));
};

// albums route controller
export const getAlbumDataFromFile = async (req, res, next) => {
  const albumData = await readFile('./data/data.json', 'utf-8');
  if (!albumData) throw new AppError(404, 'No albums found.');

  res.status(200).json({
    status: 'success',
    data: albumData
  });
};

// updates route controller
export const getLastUpdateFromDb = async (req, res, next) => {
  const lastUpdate = await Update.find();
  if (!lastUpdate) throw new AppError(404, 'No updates found.');

  res.status(200).json({
    status: 'success',
    data: lastUpdate[0].lastUpdated
  });
};