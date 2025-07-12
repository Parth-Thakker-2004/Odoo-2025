import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?:number;
}

const connection : ConnectionObject = {}

async function dbConnect():Promise<void>{
    if(connection.isConnected) {
        console.log("Already connected to database");
        return;
    }

    try {
        const connectionString = process.env.MONGODB_URI;
        if (!connectionString) {
            throw new Error("MONGODB_URI is not defined in environment variables");
        }
        
        const db = await mongoose.connect(connectionString, {})

        connection.isConnected = db.connections[0].readyState

        console.log("DB connected Successfully...")
    } catch (error) {
        console.log("Database Connection failed",error);
        process.exit(1);
    }
}

export default dbConnect;