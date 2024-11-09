import express from "express";
import { connectDB } from "./configs/dbConfig.js";
import dotenv from "dotenv";
import router from "./routes/v1/adminRoutes.js";
import { routeError } from "./utils/routeError.js";

const app = express();

dotenv.config();

connectDB();

app.use(express.json());
app.use('/api', router)
app.use('*', routeError);

const port = process.env.PORT || 8080

app.listen (port, () => {
    console.log( `App is Running on Port ${port}` );

})