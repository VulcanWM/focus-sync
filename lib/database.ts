import dbConnect from './mongodb'
import User from '../models/User'
import Update from '@/models/Update';

export async function get_user(username: string) {
    await dbConnect();
    const user = await User.find({username: username})
    if (user.length == 0){
        return false
    } else {
        return user[0]
    }
}

export async function get_user_from_email(email: string) {
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
    if (username.includes(":")){
        return "You cannot have : in your username!"
    }
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
    const created = new Date()
    const user = await User.create({username: username, email: email, goal: goal, house: house, following: [], created: created})
    return true
}

export async function get_last_update(username: string){
    const last_update = await Update.find({username: username}).sort({day: -1}).limit(1)
    return last_update
}

export async function create_update(username: string, date: Date, rating: number, tasks: object){
    const last_update = await get_last_update(username)
    var day: number;
    if (last_update.length == 0){
        day = 1
    } else {
        day = last_update[0].day + 1
    }
    const update_id: string = username + ":" + day.toString()
    const user = await get_user(username)
    if (user == false){
        return "Your username does not exist!"
    } 
    const house = user.house;
    if (Object.keys(tasks).length == 0){
        return "You have to have at least one task!"
    }
    if (Object.keys(tasks).length > 10){
        return "You can add a maximum of 10 tasks!"
    }
    if (!(rating >= 0 && rating <=5)){
        return "Your rating has to be between 0 and 5 (inclusive)!"
    }
    if (new Date() <= date){
        return "You cannot submit updates for the future!"
    }
    if (last_update.length != 0){
        if (date <= last_update[0].date){
            return "You have to submit an update after your last update's date!"
        }
    }
    const created = new Date()
    const update = await Update.create({_id: update_id, username: username, house: house, date: date, rating: rating, tasks: tasks, day: day, created: created})
    return true
}

export async function get_updates(username: string){
    const updates = await Update.find({username: username}).sort({day: -1})
    return updates
}

export async function get_latest_updates(){
    const updates = await Update.find().sort({$natural: -1}).limit(50)
    return updates
}

export async function get_latest_updates_after(id: string){
    const updates = await Update.find().sort({$natural: -1}).limit(50)
    return updates
}