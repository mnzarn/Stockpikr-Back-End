import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { config } from "./config";

class GooglePassport {
  constructor() {
    if (config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET && config.GOOGLE_CALLBACK_URL) {
      passport.use(
        new GoogleStrategy(
          {
            clientID: config.GOOGLE_CLIENT_ID,
            clientSecret: config.GOOGLE_CLIENT_SECRET,
            callbackURL: config.GOOGLE_CALLBACK_URL
          },
          (accessToken, refreshToken, profile, done) => {
            done(null, profile);
          }
        )
      );

      passport.serializeUser((user, done) => {
        done(null, user);
      });

      passport.deserializeUser((user: any, done) => {
        done(null, user);
      });
    }
  }
}

export default GooglePassport;
