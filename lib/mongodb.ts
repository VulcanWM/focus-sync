import mongoose, { Connection } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

interface Mongoose {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null; 
}

declare global {
  var mongoose: Mongoose;
}

let cached = global.mongoose as Mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {

    const cached = global.mongoose;
  
    if (!cached.promise) {
      cached.promise = new Promise((resolve: (conn: Connection) => void, reject) => {
        mongoose.connect(MONGODB_URI)
          .then((mongoose) => {
            resolve(mongoose.connection); 
          })
          .catch(reject);
      });
    }
  
    return cached.promise;
  
}

export default dbConnect;