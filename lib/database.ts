import dbConnect from './mongodb'
import User from '../models/User'

export async function create_user(username: String, email: String, goal: String, house: String) {
    await dbConnect();

    username = username.toLowerCase();

    // check if email exists
    // check if username exists

    const user = await User.create({username: username, email: email, goal: goal})
    return user
}