import mongoose from 'mongoose';
import Playlist from './playlistModel.js';

const albumSchema = mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now()
  },
  playlistSpotifyId: String,
  spotifyId: String,
  artists: Array,
  artistNames: String,
  name: String,
  releaseDate: Date,
  releaseDateString: String,
  releaseDatePrecision: String,
  releaseTimestamp: Number,
  image: String,
  type: {
    type: String,
    enum: ['LP', 'EP']
  },
  songsTotal: Number,
  genresSpotify: Array,
  genresWeb: Array,
  genresMerged: Array,
  mainGenre: String,
  label: String,
  summary: String,
  links: Object,
  active: Boolean,
  slug: String,
  playlists: [
    {
      type: {
        type: String
      },
      name: String,
      spotifyId: String
    }
  ],
});

albumSchema.pre('save', async function(next) {
  this.playlists = await Playlist.findOne({ spotifyId: this.playlistSpotifyId });
  this.playlistSpotifyId = undefined;
  next();
});

const Album = mongoose.model('Album', albumSchema);

export default Album;