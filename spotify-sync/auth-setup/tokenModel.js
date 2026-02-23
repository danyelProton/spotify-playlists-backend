import mongoose from 'mongoose';

// users collection in Mongo DB

const userSchema = new mongoose.Schema({
  name: String,
  type: {
    type: String,
    enum: ['server', 'user']
  },
  accessToken: String,
  accessTokenIssuedAt: {
    type: Number,
    default: Date.now()
  },
  accessTokenExpiresAt: Number,
  refreshToken: String,
});

const User = mongoose.model('User', userSchema);

export default User;