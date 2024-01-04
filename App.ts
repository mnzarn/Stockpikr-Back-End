import * as path from 'path';
import express from 'express';
import * as url from 'url';
import * as bodyParser from 'body-parser';
import dotenv from 'dotenv';

// Creates and configures an ExpressJS web server.
class App {

  // ref to Express instance
  public express: express.Application;
  public FMP_API_KEY: string | undefined;

  //Run configuration methods on the Express instance.
  constructor() {
    this.express = express();
    this.middleware();
    this.routes();
    dotenv.config();
    this.FMP_API_KEY = "&apikey=" + process.env.FMP_API_KEY;;
  }

  // Configure Express middleware.
  private middleware(): void {
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
  }

  // Configure API endpoints.
  private routes(): void {
    let router = express.Router();
    
    router.get('/', (req, res, next) => {
        res.send('Express + TypeScript Server');
    });

    this.express.use('/', router);

    this.express.use('/images', express.static(__dirname+'/img'));
    this.express.use('/', express.static(__dirname+'/pages'));

    }

}

export {App};