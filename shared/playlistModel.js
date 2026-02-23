import mongoose from 'mongoose';

const playlistSchema = mongoose.Schema({
  type: {
    type: String,
    enum: ['year', 'other']
  },
  name: String,
  spotifyId: String,
  active: Boolean
});

const Playlist = mongoose.model('playlist', playlistSchema);

export default Playlist;