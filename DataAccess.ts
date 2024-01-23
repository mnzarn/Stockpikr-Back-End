import Mongoose from "mongoose";
import { config } from "./config";

class DataAccess {
  static mongooseInstance: any;
  static mongooseConnection: Mongoose.Connection;
  static DB_CONNECTION_STRING: string = config.DB_CONNECTION_STRING;

  constructor() {
    DataAccess.connect();
  }

  static connect(): Mongoose.Connection {
    if (this.mongooseInstance) return this.mongooseInstance;

    this.mongooseConnection = Mongoose.connection;
    this.mongooseConnection.on("open", () => {
      console.log("Connected to mongodb.");
    });

    this.mongooseInstance = Mongoose.connect(this.DB_CONNECTION_STRING);
    return this.mongooseInstance;
  }
}
DataAccess.connect();
export { DataAccess };
