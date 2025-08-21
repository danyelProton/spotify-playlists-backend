import mongoose from 'mongoose';
import slugify from 'slugify';
import Playlist from './models/playlistModel.js';
import Album from './models/albumModel.js';
import { fetchSpotifyData } from './controllers/albumController.js';
import { asyncTimeout } from './utils.js';

const DB = process.env.DATABASE.replace('<db_password>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB).then(con => console.log('DB connection successful'));

const playlistsYears = [process.env.PLAYLIST_2025, process.env.PLAYLIST_2024, process.env.PLAYLIST_2023, process.env.PLAYLIST_2022, process.env.PLAYLIST_2021];
const playlistsOther = [process.env.PLAYLIST_VYPOCUT, process.env.PLAYLIST_JAZZ, process.env.PLAYLIST_INE, process.env.PLAYLIST_AMBIENT];
const playlists = playlistsYears.concat(playlistsOther);

// loop over playlists and create if doesn't exist 
const initialPlaylistImport = async () => {
  for (const playlistId of playlists) {
    const playlistFetched = await fetchSpotifyData(`https://api.spotify.com/v1/playlists/${playlistId}`);
    await asyncTimeout(500);
    const exists = await Playlist.findOne({ spotifyId: playlistId });
    if (!exists) Playlist.create({
      name: playlistFetched.name,
      type: `${playlistsYears.find(playlist => playlist === playlistId) ? 'year' : 'other'}`,
      spotifyId: playlistId
    });
  };
};

// get albums with empty genres from web search API
const getGenresEmpty = async () => {
  const genresEmpty = await Album.find({ genresWeb: [] });
  return genresEmpty.map(album => ({
    albumId: album.spotifyId,
    name: album.name,
    artists: album.artistNames,
    year: album.releaseDateString.slice(0, 4)
  }));;
};


const mergeGenres = async () => {
  const genresMergedMissing = await Album.find({ genresMerged: undefined });
  console.log(genresMergedMissing);

  for (const el of genresMergedMissing) {
    const genresMerged = new Set([...el.genresSpotify, ...el.genresWeb]);
    await Album.updateOne({ _id: el.id }, { $set: { genresMerged: [...genresMerged] }});
  };

  console.log('Done');
};


const addSlug = async () => {
  const slugMissing = await Album.find({ slug: undefined });

  for (const el of slugMissing) {
    const slug = slugify(`${el.artistNames} ${el.name}`, { lower: true, strict: true });
    await Album.updateOne({ _id: el.id }, { $set: { slug }});
  };

  console.log('Done');
};


// await initialPlaylistImport();
// await getGenresEmpty();
// await mergeGenres();
// await addSlug();

// node --env-file=.env initialFunctions.js