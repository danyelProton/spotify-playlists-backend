import slugify from 'slugify';
import { asyncTimeout, retry, randomNumber } from '../utils.js';
import { token } from './tokenController.js';
import Album from '../models/albumModel.js';
import Playlist from '../models/playlistModel.js';
import Update from '../models/updateModel.js';


// FETCH DATA FROM EXTERNAL APIS -----------------------------------------------------------------------
// get Spotify data
export const fetchSpotifyData = async url => {
  if (!token.accessToken) await token.getTokenFromDb();
  if (Date.now() > token.accessTokenExpiresAt - 5) await token.getNewAccessToken();

  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token.accessToken}` 
    }
  });

  // console.log(res);

  if (!res.ok) throw new Error(`Spotify request error - ${res.statusText} (${res.status})`);

  const data = await res.json();
  return data;
};




// get streaming links for different services
// WEB - https://odesli.co/
// API - https://linktree.notion.site/API-d0ebe08a5e304a55928405eb682f6741
export const fetchStreamingLinks = async albumId => {
  const url = encodeURIComponent(`https://open.spotify.com/album/${albumId}`);
  const res = await fetch (`${process.env.STREAMING_LINKS_API_URL}${url}`);

  if(!res.ok) throw new Error(`Songlink request error - ${res.statusText} (${res.status})`);

  const data = await res.json();
  return data;
};




// web search api (Linkup)
export const searchWeb = async (name, artists, year) => {
  const summaryPrompt1 = `
    Add the 'summary' key to the object. This key should contain a string - you are a music expert, a reviewer with acquired taste. Provide a short summary about the album, the essence of the album. You can be informal, even funny (but not necessarily). Finishing sentence should be in the 'If you like' style, mentioning up to 3 similar artists. Assume readers already have information about the album name, the release date, and the artist name.
  `;
  const summaryPrompt2 = `
    Add the 'summary' key to the object. This key should contain a string - you're a seasoned music critic with sharp ears and a sharper pen. Sum up the album's vibe and character in just a few sentences—capture what it feels like to listen to it. You can be casual, witty, even a bit cheeky. Wrap it up with an “If you like…” line, naming up to 3 similar artists. Assume the reader already knows the basics like album name, release date, and artist.
  `;
  const summaryPrompt3 = `
    Add the 'summary' key to the object. This key should contain a string - as an opinionated music reviewer, distill the album's soul into a short, punchy summary. Make it sound alive—whether that's warm praise, playful sarcasm, or sly humor. End with an “If you like…” suggestion that connects it to up to 3 comparable artists. Don't repeat the album's basic facts; the reader already has them.
  `;
  const summaryPrompt4 = `
    Add the 'summary' key to the object. This key should contain a string - imagine you're a music journalist who's heard it all. In a few sentences, give the reader the flavor of this album—what makes it tick, what mood it conjures, why it's worth a listen (or not). Keep it informal, and let your personality shine. Conclude with an “If you like…” closer, pointing to 1-3 artists in the same vein. No need to restate the album's title, release date, or creator.
  `;
  const summaryPrompt5 = `
    Add the 'summary' key to the object. This key should contain a string - write as a music aficionado with a knack for storytelling. Describe the album's core energy—whether that's dreamy, chaotic, groovy, or heart-wrenching—in a tight, engaging summary. Humor and casual tone welcome. End with “If you like…” followed by up to 3 artist names the reader might also enjoy. Skip repeating the obvious details; the reader's already got them.
  `;

  const summaryPrompt = eval(`summaryPrompt${randomNumber(1, 5)}`);

  const query = `
    You are given an album object in JavaScript format.

    Each album object has the following keys:
    - 'name': the name of the album
    - 'artists': the artist or artists who released the album
    - 'year': the year the album was released

    You have 4 tasks:
    1. Add the 'genres' key to the object. This key should contain an array of 3 music genres that accurately describe the style of music on the album. Genres should be in lowercase. Use single quotes. Use english language.
    2. Add the 'mainGenre' key to the object. This key should contain a string - the main genre of the album. It could be one of the following options: pop, rock, folk, country, metal, punk, jazz, electronic, ambient, rap, classical, R&B.
    3. Add the 'label' key to the object. This key should contain a string - the record label that released the album. If you're not confident or haven't found any info about record label, return N/A.
    4. ${summaryPrompt}

    Return JS object only - no other words.

    Input:
      {
        name: '${name}',
        artists: '${artists}',
        year: '${year}'
      }
  `;

  const outputSchema = `
    {
      "type": "object",
      "properties": {
        "genres": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Music genres"
        },
        "mainGenre": {
          "type": "string",
          "description": "Main music genre"
        },
        "label": {
          "type": "string",
          "description": "Record label"
        },
        "summary": {
          "type": "string",
          "description": "Short summary"
        }
      }
    }
  `;

  const linkupUrl = 'https://api.linkup.so/v1/search';

  const data = {
    q: query,
    depth: 'standard',
    outputType: 'structured',
    structuredOutputSchema: outputSchema
  };

  const res = await fetch(linkupUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.LINKUP_API_KEY}`
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) throw new Error(`Linkup (web search API) request error - ${res.statusText} (${res.status})`);

  const response = await res.json();
  // console.log(response);
  return response;
};





// GET DATABASE DATA -------------------------------------------------------------------
export const getPlaylistsFromDb = async () => {
  return await Playlist.find();
};


export const getAlbumsFromDb = async (options = {}) => {
  return await Album.find(options);
};




// GET ALBUMS ------------------------------------------------------------------------------
export const getAlbums = async playlist => {
  const playlistUrl = `${process.env.SPOTIFY_API_GET_PLAYLIST_URL}/${playlist.spotifyId}`;

  const playlistData = await fetchSpotifyData(playlistUrl);
  const playlistSongs = await getPlaylistSongs(playlistData.tracks.href);
  const uniqueAlbums = await getUniqueAlbums(playlistSongs, playlist.type);

  // console.log(uniqueAlbums);
  return uniqueAlbums;
};




// helper funtion to get songs in the playlist
const getPlaylistSongs = async songsUrl => {
  let songs = [];
  const songsData = await fetchSpotifyData(songsUrl);
  songs.push(...songsData.items);
  let nextSongsUrl = songsData.next;

  while (nextSongsUrl) {
    await asyncTimeout(500);
    const songsDataNextPage = await fetchSpotifyData(nextSongsUrl);
    nextSongsUrl = songsDataNextPage.next;
    songs.push(...songsDataNextPage.items);
  }

  return songs;
};




// helper function to get albums from playlist songs (each song object has album object so no need to fetch album data from Spotify)
// year playlists - unique values of album (year playlists contain entire albums)
// other playlists - albums with more than 2 songs in the playlist (other playlists contain entire albums as well as individual songs)
const getUniqueAlbums = async (playlistSongs, playlistType) => {
  const albums = playlistSongs.map(song => song.track.album);

  let uniqueAlbumIds;

  if (playlistType === 'year') uniqueAlbumIds = [...new Set(albums.map(album => album.id))];

  if (playlistType === 'other') {
    uniqueAlbumIds = [];
    const songsGroupByAlbums = Object.groupBy(albums, album => album.id);

    for (const [album, songs] of Object.entries(songsGroupByAlbums)) {
      const countSongs = songs.length;
      if (countSongs > 1) uniqueAlbumIds.push(album);
    }

  }

  return uniqueAlbumIds.map(id => albums.find(album => album.id === id));
};




// UPDATE DATABASE -----------------------------------------------
// get albums for given playlist in DB - compare with albums from Spotify (compare sets spotify albums vs. playlist db albums)
// 1. album linked to given playlist in DB - no action
// 2. album not linked to playlist in DB - check if album exists in DB (find album in DB)
//  2.1 yes - link to playlist, set to active (can be inactive if no linked playlist)
//  2.2 no - create album and link to playlist
// 3. album in DB not found in albums from spotify - count links
//  3.1 if 1 - remove playlist link, set to inactive
//  3.2 if more - remove playlist link
const updateDb = async (playlistDb, albumsInPlaylist) => {
  const albumsSpotifySet = new Set(albumsInPlaylist.map(album => album.id));
  const albumsInDb = await getAlbumsFromDb();
  const albumsDbSet = new Set(albumsInDb.filter(album => album.playlists?.find(playlist => playlist.spotifyId === playlistDb.spotifyId)).map(album => album.spotifyId));
  // console.log(albumsSpotifySet);
  // console.log(albumsDbSet);
  // console.log(albumsSpotifySet);

  const missingInDbPlaylist = albumsSpotifySet.difference(albumsDbSet);
  // log
  console.log(missingInDbPlaylist.size, 'album(s) to create/link in database');

  if (missingInDbPlaylist.size) {
    for (const albumId of [...missingInDbPlaylist]) {
      const existInDb = albumsInDb.find(albumDb => albumDb.spotifyId === albumId);
      if (existInDb) await Album.updateOne({ spotifyId: albumId }, { $push: { playlists: playlistDb }, $set: { active: true }});
      if (!existInDb) {
        const albumToCreate = albumsInPlaylist.find(album => album.id === albumId);
        // console.log(albumToCreate);
        await createAlbumInDb(albumToCreate, playlistDb.spotifyId);
      }
    }
  }

  const removeFromDb = albumsDbSet.difference(albumsSpotifySet);
  // log
  console.log(removeFromDb.size, 'album(s) to set inactive/unlink in database');

  if (removeFromDb.size) {
    for (const albumId of [...removeFromDb]) {
      const albumData = albumsInDb.find(album => album.spotifyId === albumId);
      const countPlaylists = albumData.playlists.length;
      if (countPlaylists === 1) await Album.updateOne({ spotifyId: albumId }, { $pull: { playlists: { spotifyId: playlistDb.spotifyId }}, $set: { active: false }});
      if (countPlaylists > 1) await Album.updateOne({ spotifyId: albumId }, { $pull: { playlists: { spotifyId: playlistDb.spotifyId }}});
    }
  }
};




// create album in database
const createAlbumInDb = async (album, playlistId) => {
  album.artistDb = album.artists.map(artist => ({ spotifyId: artist.id, name: artist.name }));
  album.artistNames = album.artistDb.map(artist => artist.name).join(', ');
  const artistsData = await fetchSpotifyData(album.artists[0].href);
  album.genresSpotify = artistsData.genres;
  const links = await fetchStreamingLinks(album.id);
  album.links = links.linksByPlatform;
  const [year, month, day] = album.release_date.split('-');
  album.releaseDate = new Date(year, month - 1, day);
  album.releaseTimestamp = Number((album.releaseDate.getTime() / 1000).toFixed(0));
  album.slug = slugify(`${album.artistNames} ${album.name}`, { lower: true, strict: true });
  // console.log(year, month, day);
  
  const webSearch = await searchWeb(album.name, album.artistNames, year);

  album.genresMerged = [...new Set([...album.genresSpotify, ...webSearch.genres])];


  await Album.create({
    playlistSpotifyId: playlistId,
    spotifyId: album.id,
    artists: album.artistDb,
    artistNames: album.artistNames,
    name: album.name,
    image: album.images[0].url,
    genresSpotify: album.genresSpotify,
    genresWeb: webSearch.genres,
    genresMerged: album.genresMerged,
    mainGenre: webSearch.mainGenre,
    label: webSearch.label,
    summary: webSearch.summary,
    releaseDate: album.releaseDate,
    releaseDateString: album.release_date,
    releaseDatePrecision: album.release_date_precision,
    releaseTimestamp: album.releaseTimestamp,
    type: album.album_type === 'album' ? 'LP' : 'EP',
    songsTotal: album.total_tracks,
    links: album.links,
    active: true,
    slug: album.slug
  });

  // log
  console.log(`Album '${album.artistNames} - ${album.name}' created in DB`);

  // streaming links API rate limit is 10 requests per minute - wait (little over) 6 seconds
  await asyncTimeout(6100);
};




// update lastUpdated field in db
const lastUpdatedDb = async () => {
  const lastUpdatedDoc = await Update.find();

  if (lastUpdatedDoc.length) await Update.updateOne({ _id: lastUpdatedDoc[0].id }, { $set: { lastUpdated: new Date() }});
  if (!lastUpdatedDoc.length) await Update.create({ lastUpdated: new Date() });
};




// MAIN FUNCTION ---------------------------------------------------------------------------------------
// main function to get album from Spotify and save them to database
export const getAndSaveAlbums = async (playlistId = '') => {
  // console.log(await getAlbumsFromDb());
  
  // get playlists in DB
  const allPlaylistsInDb = await retry(getPlaylistsFromDb, 'getPlaylistsFromDb');
  const playlists = playlistId ? [allPlaylistsInDb.find(el => el.spotifyId === playlistId)] : allPlaylistsInDb;

  for (const playlist of playlists) {
    // log
    console.log(`Working on the '${playlist.name}' playlist`);
    // get albums in Spotify for each playlist
    const albumsInPlaylist = await retry(getAlbums, 'getAlbums', {}, playlist);
    // console.log(albumsInPlaylist);
    await retry(updateDb, 'updateDb', {}, playlist, albumsInPlaylist);
  }

  // update log db
  await lastUpdatedDb();

  // log
  console.log('Finished');
};