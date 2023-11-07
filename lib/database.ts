import dbConnect from './mongodb'
import User from '../models/User'
import Update from '@/models/Update';
import Topic from '@/models/Topic';
import { profanity } from '@2toad/profanity';
import {admins} from '../lib/admins'
import { Schema } from 'mongoose';


interface Tasks {
    [task: string]: number;  
}

interface TopicObjectType {
    [key: string]: string[]
}

type UpdateType = {
    tasks: {
      [task: string]: number;  
    },
    day: number,
    username: string,
    _id: string,
    created: Date,
    house: string
}

type TopicType = {
    _id: Schema.Types.ObjectId
    name: string,
    username: string,
    tasks: string[],
    status: boolean,
    totalTime: number
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

export async function create_update(username: string, date: Date, rating: number, tasksOriginal: Tasks, mood: string, topics: string[]){
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
    const topicsObject:TopicObjectType = {}
    for (let i in topics){
        const name = topics[i]
        if (name != "No topic"){
            if (Object.keys(topicsObject).includes(name)){
                const oldArray = topicsObject[name]
                oldArray.push(i)
                topicsObject[name] = oldArray
            } else {
                topicsObject[name] = [i]
            }
        }
    }
    for (let name of Object.keys(topicsObject)){
        const topic = await get_topic(name, username)
        var time = 0;
        const topicTasks = topic.tasks;
        for (let taskIndex of topicsObject[name]){
            topicTasks.push(String(day) + ":" + taskIndex)
            time += Object.values(tasksOriginal)[parseInt(taskIndex)]
        }
        const newTotalTime = topic.totalTime + time;
        await Topic.findOneAndUpdate({_id: topic._id}, {totalTime: newTotalTime, tasks: topicTasks});
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
    const update: UpdateType = await get_update(update_id)
    if (update.username == admin){
        // do nothing
    }
    else if (admins.includes(admin)){
        // do nothing
    } else {
        return "You are not an admin!"
    }
    const day = String(update.day)
    const allTopics: TopicType[] = await get_all_topics(update.username);
    for (let topic of allTopics){
        var newTotalTime = topic.totalTime
        var newTasks = topic.tasks;
        for (let taskId of newTasks){
            if (taskId.startsWith(`${day}:`)){
                newTasks = newTasks.filter(item => item !== taskId)
                const time = Object.values(update.tasks)[parseInt(taskId.split(":")[1])]
                newTotalTime = newTotalTime - time
            }
        }
        if (newTasks.length != topic.tasks.length){
            await Topic.findOneAndUpdate({_id: topic._id}, {totalTime: newTotalTime, tasks: newTasks});
        }
    }
    await Update.deleteOne({_id: update_id})

    return true
}

export async function get_all_topics(username: string){
    const topics = await Topic.find({username: username})
    return topics
}

export async function create_topic(name: string, username: string){
    const topics = await get_all_topics(username)
    const user = await get_user(username)
    if (user == false){
        return "You are not logged in!"
    }
    if (user.plan == "Standard" && topics.length >= 10){
        return "You can only have 10 topics!"
    }
    if (user.plan == "Premium" && topics.length >= 25){
        return "You can only have 25 topics!"
    }
    if (name.length > 25){
        return "You cannot have more than 25 characters in your topic name!"
    }
    if (name.length < 2){
        return "You must have more than 1 character in your topic name!"
    }
    let names = topics.map(m => m.name);
    if (names.includes(name)){
        return "You already have a topic with this name!"
    }
    if (name == "No"){
        return "Your topic name can't be No!"
    }
    const document = {name: name, username: username, tasks: [], status: true, totalTime: 0}
    await Topic.create(document)
    return document
}

export async function get_open_topics(username: string){
    const topics = await Topic.find({username: username, status: true})
    return topics
}

export async function get_closed_topics(username: string){
    const topics = await Topic.find({username: username, status: false})
    return topics
}

export async function get_topic(name: string, username: string){
    const topics = await Topic.find({name: name, username: username})
    if (topics.length == 0){
        return false
    } else {
        return topics[0]
    }
}

export async function delete_topic(name: string, username: string){
    const topic = await get_topic(name, username)
    if (topic == false){
        return "This topic doesn't exist!"
    }
    await Topic.deleteOne({_id: topic._id})
    return true
}

export async function close_topic(name: string, username: string){
    const topic = await get_topic(name, username)
    if (topic == false){
        return "This topic doesn't exist!"
    }
    if (topic.status == false){
        return 'This topic is already closed!'
    }
    topic['status'] = false
    await Topic.findOneAndUpdate({_id: topic._id}, {status: false});
    return topic
}

export async function reopen_topic(name: string, username: string){
    const topic = await get_topic(name, username)
    if (topic == false){
        return "This topic doesn't exist!"
    }
    if (topic.status == true){
        return 'This topic is already open!'
    }
    topic['status'] = true
    await Topic.findOneAndUpdate({_id: topic._id}, {status: true});
    return topic
}