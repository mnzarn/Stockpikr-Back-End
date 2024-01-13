import { Model, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { DataAccess } from "../DataAccess";
import { IUserModel } from "../interfaces/IUserModel";

class UserModel {
  public schema: Schema;
  public model: Model<IUserModel>;

  public constructor() {
    this.createSchema();
    this.createModel();
  }

  public createSchema(): void {
    this.schema = new Schema(
      {
        userID: String,
        firstName: String,
        lastName: String,
        address: String,
        phoneNumber: String
      },
      {
        collection: "users",
        versionKey: false
      }
    );
  }

  public async createModel() {
    await DataAccess.connect();
    this.model = DataAccess.mongooseConnection.model<IUserModel>("users", this.schema);
  }

  public async addUser(firstName: string, lastName: string, address: string, phoneNumber: string) {
    const userID = uuidv4();
    console.log(userID);

    const newUser = new this.model({
      userID: userID,
      firstName: firstName,
      lastName: lastName,
      address: address,
      phoneNumber: phoneNumber
    });

    await newUser.save();
    return userID;
  }

  public async updateUser(userID: string, firstName: string, lastName: string, address: string, phoneNumber: string) {
    return this.model.findOneAndUpdate(
      { userID: userID },
      { firstName, lastName, address, phoneNumber },
      { new: true }
    );
  }

  public async getUserByID(userID: string) {
    return this.model.findOne({ userID: userID });
  }

  public async getUsers() {
    return this.model.find();
  }
}

export { UserModel };
