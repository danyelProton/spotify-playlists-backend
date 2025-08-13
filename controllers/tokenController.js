import crypto from 'node:crypto';
import querystring from 'node:querystring';
import User from '../models/tokenModel.js';


// SPOTIFY AUTHORIZATION, AUTHENTICATION

class Token {
  static clientId = process.env.SPOTIFY_CLIENT_ID;
  static clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  static redirectUri = process.env.SPOTIFY_REDIRECT_URI;

  static algorithm = 'aes-256-cbc';
  static key = process.env.CRYPTO_KEY;
  static iv = process.env.CRYPTO_INITIALIZATION_VECTOR;

  authCode;
  accessToken;
  accessTokenIssuedAt;
  accessTokenExpiresAt;
  refreshToken;

  // REPEATED LOGIN TO SPOTIFY ACCOUNT, GET ACCESS TOKEN
  // https://developer.spotify.com/documentation/web-api/tutorials/code-flow

  // helper function to fetch access token (new or using refresh token)
  async fetchToken(params) {
    const fetchToken = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + (new Buffer.from(Token.clientId + ':' + Token.clientSecret).toString('base64'))
      },
      body: params
    });

    const tokenData = await fetchToken.json();
    return tokenData;
  }

  // get first access token
  async getAccessToken() {
    const params = querystring.stringify({
      grant_type: 'authorization_code',
      code: this.authCode,
      redirect_uri: Token.redirectUri
    });

    const token = await this.fetchToken(params);
    this.saveTokenToObject(token);
    await this.saveTokenToDb();
  }

  // get new access token using refresh token
  async getNewAccessToken() {
    const params = querystring.stringify({
      grant_type: 'refresh_token',
      refresh_token: this.refreshToken,
    });
    
    const newToken = await this.fetchToken(params);
    this.saveTokenToObject(newToken);
    await this.saveTokenToDb();
  }

  // helper function to set object values with data from Spotify
  saveTokenToObject(token) {
    this.accessToken = token.access_token;
    if (token.refresh_token) this.refreshToken = token.refresh_token;
    this.accessTokenIssuedAt = Date.now();
    this.accessTokenExpiresAt = this.accessTokenIssuedAt + token.expires_in * 1000;
  }

  // save token to db
  async saveTokenToDb() {
    const user = await User.findOne({ name: 'Daniel' });

    if (user) {
      await user.updateOne({
        accessToken: this.encryptToken(),
        accessTokenIssuedAt: this.accessTokenIssuedAt,
        accessTokenExpiresAt: this.accessTokenExpiresAt,
        // refreshToken: this.refreshToken ? this.encryptToken('refresh') : '',
        ...(this.refreshToken) && { refreshToken: this.encryptToken('refresh') }
      });
    } else {
      await User.create({
        name: 'Daniel',
        type: 'server',
        accessToken: this.encryptToken(),
        accessTokenIssuedAt: this.accessTokenIssuedAt,
        accessTokenExpiresAt: this.accessTokenExpiresAt,
        // refreshToken: this.refreshToken ? this.encryptToken('refresh') : '',
        ...(this.refreshToken) && { refreshToken: this.encryptToken('refresh') }
      });
    };
  }

  async getTokenFromDb() {
    const tokenDb = await User.findOne({ name: 'Daniel' });

    token.accessToken = tokenDb.accessToken ;
    token.accessToken = token.decryptToken();
    token.refreshToken = tokenDb.refreshToken;
    token.refreshToken = token.decryptToken('refresh');
    token.accessTokenIssuedAt = tokenDb.accessTokenIssuedAt;
    token.accessTokenExpiresAt = tokenDb.accessTokenExpiresAt;

    if (Date.now() > tokenDb.accessTokenExpiresAt - 5) await token.getNewAccessToken();
  }

  encryptToken(type) {
    const cipher = crypto.createCipheriv(Token.algorithm, Token.key, Token.iv);
    let encrypted = cipher.update(type === 'refresh' ? this.refreshToken : this.accessToken, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  decryptToken(type) {
    const decipher = crypto.createDecipheriv(Token.algorithm, Token.key, Token.iv);
    let decrypted = decipher.update(type === 'refresh' ? this.refreshToken : this.accessToken, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}



// INITIAL LOGIN TO SPOTIFY ACCOUNT, CONFIRM SCOPES, GET AUTHORIZATION CODE AND ACCESS AND REFRESH TOKEN (LOGIN AND CALLBACK ROUTE HANDLERS)
// https://developer.spotify.com/documentation/web-api/tutorials/code-flow
const generateRandomString = length => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
  let string = '';
  for (let i = 0; i < length; i++) {
    string += characters[Math.floor(Math.random() * characters.length)];
  };
  return string;
};

export const loginHandler = (req, res, next) => {
  const state = generateRandomString(16);
  const scope = 'user-read-private user-read-email user-top-read';

  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: Token.clientId,
      scope,
      redirect_uri: Token.redirectUri,
      state
    }));
};

export const callbackHandler = async (req, res, next) => {
  token.authCode = req.query.code;
  const state = req.query.state;

  if (!state) return res.redirect('#' + querystring.stringify({ error: 'state_mismatch' }));

  await token.getAccessToken();

  res.send();
};

export const token = new Token();