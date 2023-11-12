import * as path from 'path';
import * as express from 'express';
import * as url from 'url';
import * as bodyParser from 'body-parser';
import dotenv from 'dotenv';
import {App} from './App';

dotenv.config();

const port = process.env.PORT;
let server: any = new App().express;
server.listen(port);
console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
