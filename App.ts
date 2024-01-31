import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import session from "express-session";
import passport from "passport";
import * as path from "path";
import { Middleware } from "services/middleware";
import { fileURLToPath } from "url";
import GooglePassport from "./GooglePassport";
import { config } from "./config";
import { UserModel } from "./models/UserModel";
import stockDataRouter from "./routes/stockPrice";
import userRouter from "./routes/users";
import watchlistRouter from "./routes/watchlists";
// workaround when using ES module: https://iamwebwiz.medium.com/how-to-fix-dirname-is-not-defined-in-es-module-scope-34d94a86694d
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

class App {
  public express: express.Application;
  public FMP_API_KEY: string | undefined;
  public Users: UserModel;
  public googlePassport: GooglePassport;

  constructor(middleware: Middleware) {
    this.Users = UserModel.getInstance();
    this.express = express();
    this.middleware();
    this.routes(middleware);

    this.googlePassport = new GooglePassport();

    this.FMP_API_KEY = "&apikey=" + config.FMP_API_KEY;
  }

  private middleware(): void {
    this.express.use(cors());
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
    this.express.use(session({ secret: "toxic flamingo" }));
    this.express.use(passport.initialize());
    this.express.use(passport.session());
  }

  private routes(middleware: Middleware): void {
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

    router.get(
      "/login/federated/google/callback",
      (req, res, next) => {
        req.session.save();
        next();
      },
      passport.authenticate("google", {
        failureRedirect: "http://localhost:3000/signin"
      }),
      async (req, res) => {
        console.log("Successful login");

        const googleProfile: any = JSON.parse(JSON.stringify(req.user));
        let doesUserExist: any = await this.Users.getUserByAuth(googleProfile.id);

        if (!doesUserExist) {
          console.log("User doesn't exist. Creating a new entry for this user in the DB");
          let newUser: any = await this.Users.addUser(
            googleProfile.id,
            googleProfile.name.givenName,
            googleProfile.name.familyName,
            googleProfile.emails[0].value,
            "123456789"
          );
          console.log("New user created with ID: ", newUser);
          req.session["uuid"] = newUser;
        } else {
          console.log("User already exists, logging in...");
          req.session["uuid"] = doesUserExist.userID;
        }
        req.session.save();
        console.log("Session info has been saved as follows - ", req.session);

        // TODO: Have to change this to a relative link, otherwise the session information is lost
        // Solution is to inject frontend build files into the backend and serve them
        res.redirect("http://localhost:3000/dashboard");
      }
    );

    router.get("/logout", (req, res) => {
      req.session.destroy((err) => {
        if (err) {
          console.log("Error destroying session:", err);
          return res.status(500).send("Internal Server Error");
        }
        res.redirect("http://localhost:3000/signin");
      });
    });

    this.express.use(
      "/api/users",
      middleware ? middleware.validateAuth : (req, res, next) => next(),
      (req, res, next) => {
        userRouter(req, res, next);
      }
    );

    this.express.use(
      "/api/watchlists",
      middleware ? middleware.validateAuth : (req, res, next) => next(),
      (req, res, next) => {
        watchlistRouter(req, res, next);
      }
    );

    // Test routes
    this.express.use("/test/api/users", (req, res, next) => {
      userRouter(req, res, next);
    });

    this.express.use("/test/api/watchlists", (req, res, next) => {
      watchlistRouter(req, res, next);
    });

    this.express.use("/api/stockdata", stockDataRouter);
    this.express.use("/", router);
    this.express.use("/images", express.static(path.join(__dirname, "img")));
    this.express.use("/", express.static(path.join(__dirname, "pages")));
  }
}

export { App };
