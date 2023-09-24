import dbConnect from './mongodb'
import User from '../models/User'

export async function get_user(username: String) {
    await dbConnect();
    const user = await User.find({username: username})
    if (user.length == 0){
        return false
    } else {
        return user[0]
    }
}

export async function get_user_from_email(email: String) {
    await dbConnect();
    const user = await User.find({email: email})
    if (user.length == 0){
        return false
    } else {
        return user[0]
    }
}

export async function create_user(username: string, email: string, goal: string, house: string) {
    await dbConnect();
    username = username.toLowerCase();
    if (await get_user(username) != false){
        return "This username already exists!"
    }
    if (await get_user_from_email(email) != false){
        return "This email is already being used for an account!"
    }
    const houses = ['verdant', 'lumos', 'erythro', 'azurite']
    if (!houses.includes(house)){
        return "Select a valid house!"
    }
    if (username.length > 20){
        return "Your username cannot have more than 20 characters!"
    }
    if (goal.length < 20){
        return "Your goal must contain at least 20 characters!"
    }
    if (goal.length > 100){
        return "Your goal cannot contain more than 100 characters!"
    }
    const user = await User.create({username: username, email: email, goal: goal})
    return true
}