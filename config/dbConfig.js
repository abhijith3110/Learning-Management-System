import mongoose from "mongoose";

export const connectDB = async () => {

    try {
        const connect = await mongoose.connect(process.env.DB_CONNECT_STRING)
        console.log(`${connect.connection.name} Database is Connected Successfully`);
        

    } catch (error) {
        console.log(error);
        process.exit(1);
    }

}