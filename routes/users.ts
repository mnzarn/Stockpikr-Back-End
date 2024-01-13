import { Router } from 'express';
import {UserModel} from '../models/UserModel';

const userRouter = Router();
const Users = new UserModel();

// POPULATE DB
// const userID = Users.addUser('John', 'Doe', '123 Main Street', '1234567890');
// console.log('User added with ID:', userID);

export const getUserById = (id: string) => {
  
}

//Get one user by ID
userRouter.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await Users.getUserByID(id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});  

//Get all users
userRouter.get('/', async (req, res, next) => {
  try {
    const users = await Users.getUsers();
    if (users.length > 0) {
      res.status(200).json(users);
    } else {
      res.status(404).json({ error: 'Users not found' });
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//Update user information by ID
userRouter.put('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const { firstName, lastName, address, phoneNumber } = req.body;

    const updatedUser = await Users.updateUser(id, firstName, lastName, address, phoneNumber);

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default userRouter;
