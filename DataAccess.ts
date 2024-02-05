import Mongoose from "mongoose";
import { config } from "./config";

class DataAccess {
  static mongooseInstance: any;
  static mongooseConnection: Mongoose.Connection;
  static DB_CONNECTION_STRING: string = config.DB_CONNECTION_STRING;

  constructor(dbConnectionString?: string) {
    DataAccess.connect(dbConnectionString);
  }

  static connect(dbConnectionString?: string): Mongoose.Connection {
    if (this.mongooseInstance) return this.mongooseInstance;
    return this.create(dbConnectionString);
  }

  static create(dbConnectionString?: string): Mongoose.Connection {
    this.mongooseConnection = Mongoose.connection;
    this.mongooseConnection.on("open", () => {
      console.log("Connected to mongodb.");
    });

    this.mongooseInstance = Mongoose.connect(dbConnectionString ?? this.DB_CONNECTION_STRING);
    return this.mongooseConnection;
  }

  static disconnect() {
    return Mongoose.disconnect();
  }
}
export { DataAccess };
