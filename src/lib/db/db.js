import mongoose from "mongoose";

const connectionString = `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@cluster0.4h75t.mongodb.net/${process.env.MONGO_DB_DB_NAME}?retryWrites=true&w=majority`;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export default async function connectToDb() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const options = {
      bufferCommands: false,
    };

    cached.promise = mongoose
      .connect(connectionString, options)
      .then((mongoose) => {
        console.log("Database connection established.");
        return mongoose;
      });
  }

  cached.conn = await cached.promise;

  return cached.conn;
}
