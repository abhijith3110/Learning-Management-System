import express from "express";
import { connectDB } from "./configs/dbConfig.js";
import dotenv from "dotenv";

const app = express();

dotenv.config();

connectDB();

app.use(express.json());

const port = process.env.PORT || 8080

app.listen (port, () => {
    console.log( `App is Running on Port ${port}` );

})