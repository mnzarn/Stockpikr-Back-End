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
    const purchasedStocksRouter = purchasedStocksRouterHandler(this.models.purchasedStockModel, this.models.latestStockInfoModel);
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

