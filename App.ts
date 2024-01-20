import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import passport from "passport";
import * as passportGoogle from "passport-google-oauth20";
import * as path from "path";
import { fileURLToPath } from "url";
import { config } from "./config";
import userRouter from "./routes/users";
import watchlistRouter from "./routes/watchlists";
// workaround when using ES module: https://iamwebwiz.medium.com/how-to-fix-dirname-is-not-defined-in-es-module-scope-34d94a86694d
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

class App {
  public express: express.Application;
  public FMP_API_KEY: string | undefined;

  constructor() {
    this.express = express();
    this.middleware();
    this.routes();

    // Passport configuration
    this.express.use(passport.initialize());
    passport.use(
      new passportGoogle.Strategy(
        {
          clientID: config.GOOGLE_CLIENT_ID,
          clientSecret: config.GOOGLE_CLIENT_SECRET,
          callbackURL: "http://localhost:3000/dashboard"
        },
        (accessToken, refreshToken, profile, done) => {
          console.log(profile);
        }
      )
    );

    this.FMP_API_KEY = "&apikey=" + config.FMP_API_KEY;
  }

  private middleware(): void {
    this.express.use(cors());
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
  }

  private routes(): void {
    const router = express.Router();

    router.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      res.header("Access-Control-Allow-Methods", "*");
      next();
    });

    router.get("/", (req, res, next) => {
      res.send("Express + TypeScript Server");
    });

    router.get(
      "/login/federated/google",
      passport.authenticate("google", {
        scope: ["profile", "email"]
      }),
      (req, res) => {
        res.send("Successful login");
      }
    );

    this.express.use("/api/users", userRouter);
    this.express.use("/api/watchlists", watchlistRouter);

    this.express.use("/", router);
    this.express.use("/images", express.static(path.join(__dirname, "img")));
    this.express.use("/", express.static(path.join(__dirname, "pages")));
  }
}

export { App };
