import mongoose from "mongoose";

interface IUserModel extends mongoose.Document {
  authID: string;
  userID: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profilePic: string;
}

export { IUserModel };
