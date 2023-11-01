import dbConnect from './mongodb'
import User from '../models/User'
import Update from '@/models/Update';
import Milestone from '@/models/Milestone';
import { profanity } from '@2toad/profanity';
import {admins} from '../lib/admins'

interface Tasks {
    [task: string]: number;  
}

interface MilestoneObjectType {
    [key: string]: string[]
}

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
    username = username.replaceAll(" ", "_")
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
    goal = profanity.censor(goal)
    if (goal.length < 20){
        return "Your goal must contain at least 20 characters!"
    }
    if (goal.length > 100){
        return "Your goal cannot contain more than 100 characters!"
    }
    const created = new Date()
    const user = await User.create({username: username, email: email, goal: goal, house: house, created: created, banned: false, badges: ['Early User'], plan: "Standard"})
    return true
}

export async function get_last_update(username: string){
    const last_update = await Update.find({username: username}).sort({day: -1}).limit(1)
    return last_update
}

export async function create_update(username: string, date: Date, rating: number, tasksOriginal: Tasks, mood: string, milestones: string[]){
    const user = await get_user(username)
    if (user == false){
        return "Your username does not exist!"
    } 
    if (user.banned != false){
        return `You are banned for reason: ${String(user.banned)}`
    }
    const created = new Date()
    const last_update = await get_last_update(username)
    var day: number;
    if (last_update.length == 0){
        const account_created: Date = user.created;
        account_created.setDate(account_created.getDate() - 2);
        if (account_created > created){
            return "You can only submit updates for dates after account creation!"
        }
        day = 1
    } else {
        day = last_update[0].day + 1
    }
    const update_id: string = username + ":" + day.toString()
    const house = user.house;
    const tasks: Tasks = {}
    for (const task in tasksOriginal) {
        if (profanity.censor(task) == task){
            if (task.length <= 50){
                tasks[task as string] = tasksOriginal[task]
            }
        }
    }
    if (Object.keys(tasks).length == 0){
        return "You have to have at least one task (no profanity allowed)!"
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
    const update = await Update.create({_id: update_id, username: username, house: house, date: date, rating: rating, tasks: tasks, day: day, created: created, mood: mood})
    const milestonesObject:MilestoneObjectType = {}
    for (let i in milestones){
        const name = milestones[i]
        if (Object.keys(milestonesObject).includes(name)){
            const oldArray = milestonesObject[name]
            oldArray.push(i)
            milestonesObject[name] = oldArray
        } else {
            milestonesObject[name] = [i]
        }
    }
    console.log(milestonesObject)
    for (let name of Object.keys(milestonesObject)){
        const milestone = await get_milestone(name, username)
        var time = 0;
        const milestoneTasks = milestone.tasks;
        for (let taskIndex of milestonesObject[name]){
            milestoneTasks.push(String(day) + ":" + taskIndex)
            time += Object.values(tasksOriginal)[parseInt(taskIndex)]
        }
        const newTotalTime = milestone.totalTime + time;
        await Milestone.findOneAndUpdate({_id: milestone._id}, {totalTime: newTotalTime, tasks: milestoneTasks});
    }
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

export async function get_latest_updates_after(date: Date){
    const updates = await Update.find({created: {$lt: date}}).sort({$natural: -1}).limit(50)
    return updates
}

export async function get_update(id: string){
    const updates = await Update.find({_id: id})
    if (updates.length == 0){
        return false
    } else {
        return updates[0]
    }
}

export async function ban_user(username: string, admin: string, reason: string){
    if (admins.includes(admin) == false){
        return "You are not an admin!"
    }
    const user = await get_user(username)
    if (user.banned != false){
        return `${username} is already banned!`
    }
    await User.findOneAndUpdate({username: username}, {banned: reason});
    return true
}

export async function unban_user(username: string, admin: string){
    if (admins.includes(admin) == false){
        return "You are not an admin!"
    }
    const user = await get_user(username)
    if (user.banned == false){
        return `${username} is not banned!`
    }
    await User.findOneAndUpdate({username: username}, {banned: false});
    return true
}

export async function delete_update(update_id: string, admin: string){
    const update = await get_update(update_id)
    if (update.username == admin){
        await Update.deleteOne({_id: update_id})
        return true
    }
    else if (admins.includes(admin)){
        await Update.deleteOne({_id: update_id})
        return true
    } else {
        return "You are not an admin!"
    }
}

export async function get_all_milestones(username: string){
    const milestones = await Milestone.find({username: username})
    return milestones
}

export async function create_milestone(name: string, username: string){
    const milestones = await get_all_milestones(username)
    const user = await get_user(username)
    if (user == false){
        return "You are not logged in!"
    }
    if (user.plan == "Standard" && milestones.length >= 10){
        return "You can only have 10 milestones!"
    }
    if (user.plan == "Premium" && milestones.length >= 25){
        return "You can only have 25 milestones!"
    }
    if (name.length > 25){
        return "You cannot have more than 25 characters in your milestone name!"
    }
    if (name.length < 2){
        return "You must have more than 1 character in your milestone name!"
    }
    let names = milestones.map(m => m.name);
    if (names.includes(name)){
        return "You already have a milestone with this name!"
    }
    if (name == "No"){
        return "Your milestone name can't be No!"
    }
    const document = {name: name, username: username, tasks: [], status: true, totalTime: 0}
    await Milestone.create(document)
    return document
}

export async function get_open_milestones(username: string){
    const milestones = await Milestone.find({username: username, status: true})
    return milestones
}

export async function get_closed_milestones(username: string){
    const milestones = await Milestone.find({username: username, status: false})
    return milestones
}

export async function get_milestone(name: string, username: string){
    const milestones = await Milestone.find({name: name, username: username})
    if (milestones.length == 0){
        return false
    } else {
        return milestones[0]
    }
}

export async function delete_milestone(name: string, username: string){
    const milestone = await get_milestone(name, username)
    if (milestone == false){
        return "This milestone doesn't exist!"
    }
    await Milestone.deleteOne({_id: milestone._id})
    return true
}

export async function close_milestone(name: string, username: string){
    const milestone = await get_milestone(name, username)
    if (milestone == false){
        return "This milestone doesn't exist!"
    }
    if (milestone.status == false){
        return 'This milestone is already closed!'
    }
    milestone['status'] = false
    await Milestone.findOneAndUpdate({_id: milestone._id}, {status: false});
    return milestone
}

export async function reopen_milestone(name: string, username: string){
    const milestone = await get_milestone(name, username)
    if (milestone == false){
        return "This milestone doesn't exist!"
    }
    if (milestone.status == true){
        return 'This milestone is already open!'
    }
    milestone['status'] = true
    await Milestone.findOneAndUpdate({_id: milestone._id}, {status: true});
    return milestone
}