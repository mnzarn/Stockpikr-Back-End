import Mongoose from "mongoose";
import { config } from "./config";

class Access {
  static mongooseInstance: any;
  static mongooseConnection: Mongoose.Connection;
  static DB_CONNECTION_STRING: string = config.DB_CONNECTION_STRING;

  constructor() {
    Access.connect();
  }

  static connect(): Mongoose.Connection {
    if (this.mongooseInstance) return this.mongooseInstance;

    this.mongooseConnection = Mongoose.connection;
    this.mongooseConnection.on("open", () => {
      console.log("Connected to MongoDB");
    });

    this.mongooseInstance = Mongoose.connect(this.DB_CONNECTION_STRING);
    return this.mongooseInstance;
  }
}

Access.connect();
export { Access };
