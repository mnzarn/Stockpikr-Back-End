import * as path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import userRouter from './routes/users';

class App {
  public express: express.Application;

  constructor() {
    this.express = express();
    this.middleware();
    this.routes();
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
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      res.header("Access-Control-Allow-Methods", "*");
      next();
    });


    router.get('/', (req, res, next) => {
      res.send('Express + TypeScript Server');
    });

    this.express.use('/api/users', userRouter);

    this.express.use('/', router);
    this.express.use('/images', express.static(path.join(__dirname, 'img')));
    this.express.use('/', express.static(path.join(__dirname, 'pages')));
  }
}

export { App };
