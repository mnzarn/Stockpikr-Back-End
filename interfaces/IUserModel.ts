import mongoose from 'mongoose';

interface IUserModel extends mongoose.Document {
    userID: string,
    firstName: string,
    lastName: string,
    address: string,
    phoneNumber: string,
}

export {IUserModel}