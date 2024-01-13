import Mongoose from "mongoose";
import { config } from "./config";

class DataAccess {
  static mongooseInstance: Mongoose.Mongoose;
  static mongooseConnection: Mongoose.Connection;
  static DB_CONNECTION_STRING: string = config.DB_CONNECTION_STRING;

  static async connect(): Promise<Mongoose.Connection> {
    if (this.mongooseConnection) return this.mongooseConnection;

    this.mongooseInstance = await Mongoose.connect(this.DB_CONNECTION_STRING);
    // wait til we have connected to Mongo successfully -> return our connection
    try {
      await new Promise<void>((resolve, reject) => {
        // set timeout for mongo connection
        setTimeout(reject, config.MONGO_CONN_TIMEOUT);
        this.mongooseInstance.connection.on("open", () => {
          console.log("Connected to MongoDB");
          resolve();
        });
      });
    } catch (e) {
      // do nothing because if conn reaches timeout -> there has already been a connection -> no need to connect anymore
    }
    this.mongooseConnection = this.mongooseInstance.connection;
    return this.mongooseConnection;
  }
}

export { DataAccess };
