import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import session from "express-session";
import passport from "passport";
import * as path from "path";
import { fileURLToPath } from "url";
import GooglePassport from "./GooglePassport";
import { config } from "./config";
import { LatestStockInfoModel } from "./models/LatestStockInfoModel";
import { PurchasedStockModel } from "./models/PurchasedStockModel";
import { StockDataModel } from "./models/StockData";
import { UserModel } from "./models/UserModel";
import { WatchlistModel } from "./models/WatchlistModel";
import latestStockInfoRouterHandler from "./routes/lateststockinfo";
import purchasedStocksRouterHandler from "./routes/purchasedstocks";
import stockDataRouterHandler from "./routes/stockPrice";
import userRouterHandler from "./routes/users";
import watchlistRouterHandler from "./routes/watchlists";
import { admin } from "./services/firebaseAdmin";
import { verifyFirebaseToken } from "./services/firebaseMiddleware";
import { Middleware } from "./services/middleware";
// workaround when using ES module: https://iamwebwiz.medium.com/how-to-fix-dirname-is-not-defined-in-es-module-scope-34d94a86694d
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

export interface Models {
  userModel?: UserModel;
  stockDataModel?: StockDataModel;
  watchlistModel?: WatchlistModel;
  purchasedStockModel?: PurchasedStockModel;
  latestStockInfoModel?: LatestStockInfoModel;
}

class App {
  public express: express.Application;
  public FMP_API_KEY: string | undefined;
  public googlePassport: GooglePassport;

  // depdendency injection for middleware & mongo models for easy testing
  private middlewareInstance: Middleware;

  constructor(private models: Models) {
    this.express = express();
    this.middleware();
    this.googlePassport = new GooglePassport();
    this.FMP_API_KEY = "&apikey=" + config.FMP_API_KEY;
  }

  withMiddleware(middleware: Middleware) {
    this.middlewareInstance = middleware;
    return this;
  }

  private middleware(): void {
    this.express.use(cors());
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
    this.express.use(session({ secret: "toxic flamingo", saveUninitialized: true, resave: true }));
    this.express.use(passport.initialize());
    this.express.use(passport.session());
  }

  public routes(): void {
    const router = express.Router();
    // setup all custom routers
    const userRouter = userRouterHandler(this.models.userModel);
    const stockDataRouter = stockDataRouterHandler(this.models.stockDataModel);
    const watchlistRouter = watchlistRouterHandler(this.models.watchlistModel, this.models.latestStockInfoModel);
    const purchasedStocksRouter = purchasedStocksRouterHandler(this.models.purchasedStockModel);
    const latestStockInfoRouter = latestStockInfoRouterHandler(this.models.latestStockInfoModel);

    router.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      res.header("Access-Control-Allow-Methods", "*");
      next();
    });

    router.get("/", (req, res, next) => {
      res.send("Express + TypeScript Server");
    });

    // router.get(
    //   "/login/federated/google",
    //   passport.authenticate("google", {
    //     scope: ["profile", "email"]
    //   }),
    //   (req, res) => {
    //     res.send("Successful login");
    //   }
    // );

    // router.get(
    //   "/login/federated/google/callback",
    //   (req, res, next) => {
    //     req.session.save();
    //     next();
    //   },
    //   passport.authenticate("google", {
    //     failureRedirect: "/StockPikr_Frontend/#/signin"
    //   }),
    //   async (req, res) => {
    //     const googleProfile: any = JSON.parse(JSON.stringify(req.user));
    //     let doesUserExist: any = await this.models.userModel.getUserByAuth(googleProfile.id);

    //     if (!doesUserExist) {
    //       let newUser: any = await this.models.userModel.addUser(
    //         googleProfile.id,
    //         googleProfile.name.givenName,
    //         googleProfile.name.familyName,
    //         googleProfile.emails[0].value,
    //         "123456789",
    //         googleProfile.photos[0].value
    //       );
    //       req.session["uuid"] = newUser;
    //     } else {
    //       req.session["uuid"] = doesUserExist.userID;
    //     }
    //     req.session.save();

    //     // TODO: Have to change this to a relative link, otherwise the session information is lost
    //     // Solution is to inject frontend build files into the backend and serve them
    //     res.redirect("/StockPikr_Frontend/#/dashboard");
    //   }
    // );

    router.post("/api/login", async (req, res) => {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ message: "Token is required" });
      }

      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        let user = await this.models.userModel.getUserByAuth(decodedToken.uid);

        if (!user) {
          user = await this.models.userModel.addUser(
            decodedToken.uid,
            decodedToken.name || "Unknown",
            "",
            decodedToken.email,
            "123456789",
            decodedToken.picture || ""
          );
        }

        req.session["uuid"] = user.userID;
        req.session.save();
        res.json({ success: true, user });
      } catch (error) {
        res.status(401).json({ message: "Invalid token", error });
      }
    });


    // Check if user is logged in
    // router.get("/api/login/active", (req, res) => {
    //   if (req.session["uuid"]) {
    //     res.send(true);
    //   } else {
    //     res.send(false);
    //   }
    // });

    router.get("/api/login/active", verifyFirebaseToken, (req, res) => {
      res.json({ success: true, user: req.user });
    });

    // Heartbeat route
    router.get("/heartbeat", (req, res) => {
      res.json({ status: "Alive - Dil Dhakad Raha Hai" });
    });

    router.get("/logout", (req, res) => {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).send("Internal Server Error");
        }
        res.redirect("/StockPikr_Frontend/#/signin");
      });
    });

    // this.express.use(
    //   "/api/users",
    //   this.middlewareInstance ? this.middlewareInstance.validateAuth : (req, res, next) => next(),
    //   userRouter
    // );

    // this.express.use(
    //   "/api/watchlists",
    //   this.middlewareInstance ? this.middlewareInstance.validateAuth : (req, res, next) => next(),
    //   watchlistRouter
    // );

    // this.express.use(
    //   "/api/positions",
    //   this.middlewareInstance ? this.middlewareInstance.validateAuth : (req, res, next) => next(),
    //   purchasedStocksRouter
    // );

    // // Test routes
    // // this.express.use("/test/api/users", (req, res, next) => {
    // //   userRouter(req, res, next);
    // // });

    // // this.express.use("/test/api/watchlists", (req, res, next) => {
    // //   watchlistRouter(req, res, next);
    // // });

    // this.express.use(
    //   "/api/stockdata",
    //   this.middlewareInstance ? this.middlewareInstance.validateAuth : (req, res, next) => next(),
    //   stockDataRouter
    // );

    // this.express.use(
    //   "/api/purchasedstocks",
    //   this.middlewareInstance ? this.middlewareInstance.validateAuth : (req, res, next) => next(),
    //   purchasedStocksRouter
    // );

    // this.express.use(
    //   "/api/lateststockinfo",
    //   this.middlewareInstance ? this.middlewareInstance.validateAuth : (req, res, next) => next(),
    //   latestStockInfoRouter
    // );

    this.express.use(
      "/api/users",
      verifyFirebaseToken,
      userRouter
    );

    this.express.use(
      "/api/watchlists",
      verifyFirebaseToken,
      watchlistRouter
    );

    this.express.use(
      "/api/positions",
      verifyFirebaseToken,
      purchasedStocksRouter
    );

    this.express.use(
      "/api/stockdata",
      verifyFirebaseToken,
      stockDataRouter
    );

    this.express.use(
      "/api/purchasedstocks",
      verifyFirebaseToken,
      purchasedStocksRouter
    );

    this.express.use(
      "/api/lateststockinfo",
      verifyFirebaseToken,
      latestStockInfoRouter
    );

    this.express.use("/", router);
    this.express.use("/StockPikr_Frontend", express.static("public")); // Frontend served at localhost:8080/StockPikr_Frontend
  }
}

export { App };

