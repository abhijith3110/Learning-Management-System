import express from "express";
import dotenv from "dotenv";

const app = express();

dotenv.config();

const port = process.env.PORT || 8080


app.listen (port, () => {
    console.log( `App is Running on Port ${port}` );

})