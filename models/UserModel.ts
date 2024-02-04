import Mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { IUserModel } from "../interfaces/IUserModel";
import BaseModel from "./BaseModel";

class UserModel extends BaseModel {
  public model: any;
  private static instance: UserModel;

  public constructor(connection: Mongoose.Connection) {
    super(connection);
    this.createSchema();
    this.createModel();
  }

  public createSchema = (): void => {
    this.schema = new Schema(
      {
        authID: String,
        userID: String,
        firstName: String,
        lastName: String,
        email: String,
        phoneNumber: String
      },
      {
        collection: "users"
      }
    );
  };

  public createModel = () => {
    if (!this.connection.models["users"]) {
      this.model = this.connection.model<IUserModel>("users", this.schema);
    } else {
      this.model = this.connection.models["users"];
    }
  };

  public static getInstance(connection: Mongoose.Connection): UserModel {
    if (!UserModel.instance) {
      UserModel.instance = new UserModel(connection);
    }
    return UserModel.instance;
  }

  public async addUser(authID: string, firstName: string, lastName: string, email: string, phoneNumber: string) {
    const userID = uuidv4();
    console.log(userID);

    const newUser = new this.model({
      authID: authID,
      userID: userID,
      firstName: firstName,
      lastName: lastName,
      email: email,
      phoneNumber: phoneNumber
    });

    await newUser.save();
    return userID;
  }

  public async updateUser(userID: string, firstName: string, lastName: string, email: string, phoneNumber: string) {
    return this.model.findOneAndUpdate({ userID, firstName, lastName, email, phoneNumber }, { new: true });
  }

  public async getUserByID(userID: string) {
    return this.model.findOne({ userID: userID });
  }

  public async getUserByAuth(authID: string) {
    return this.model.findOne({ authID: authID });
  }

  public async getUsers() {
    return this.model.find();
  }
}

export { UserModel };
