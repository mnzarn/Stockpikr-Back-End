import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Access } from '../Access/Access';
import { IUserModel } from '../interfaces/IUserModel';

let mongooseConnection = Access.mongooseConnection;

class UserModel {
  public schema: any;
  public model: any;

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
        phoneNumber: String,
      },
      {
        collection: 'users',
        versionKey: false,
      }
    );
  }

  public createModel(): void {
    this.model = mongooseConnection.model<IUserModel>('users', this.schema);
  }

  public async addUser(firstName: string, lastName: string, address: string, phoneNumber: string) {
    const userID = uuidv4();
    console.log(userID);

    const newUser = new this.model({
      userID: userID,
      firstName: firstName,
      lastName: lastName,
      address: address,
      phoneNumber: phoneNumber,
    });

    await newUser.save();
    return userID;
  }

  public async updateUser(userID: string, firstName: string, lastName: string, address: string, phoneNumber: string) {
  try {
    const updatedUser = await this.model.findOneAndUpdate(
      { userID: userID },
      { firstName, lastName, address, phoneNumber },
      { new: true }
    );

    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
}

  public async getUserByID(userID: string) {
    try {
      const user = await this.model.findOne({ userID: userID });
      return user;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return null;
    }
  }

  public async getUsers() {
    try {
      const users = await this.model.find();
      return users || [];
    } catch (err) {
      throw err;
    }
  }
}

export { UserModel };
