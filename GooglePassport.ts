import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { config } from "./config";

class GooglePassport {
  constructor() {
    if (!config.GOOGLE_CLIENT_ID || !config.GOOGLE_CLIENT_SECRET || !config.GOOGLE_CALLBACK_URL) {
      console.error("Google OAuth credentials are missing. Authentication will not be available.");
      return;
    }

    passport.use(
      new GoogleStrategy(
        {
          clientID: config.GOOGLE_CLIENT_ID,
          clientSecret: config.GOOGLE_CLIENT_SECRET,
          callbackURL: config.GOOGLE_CALLBACK_URL
        },
        async (accessToken, refreshToken, profile: Profile, done) => {
          try {
            // Process the profile data (e.g., save user to DB if necessary)
            done(null, profile);
          } catch (error) {
            done(null, profile);
          }
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

export default GooglePassport;
