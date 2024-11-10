import express from "express";
import { connectDB } from "./configs/dbConfig.js";
import dotenv from "dotenv";
import { routeError } from "./utils/routeError.js";
import adminRouter from "./routes/v1/adminRoutes.js";
import subjectRouter from "./routes/v1/subjectRoutes.js";

const app = express();

dotenv.config();

connectDB();

app.use(express.json());
app.use('/admin', adminRouter);
app.use('/sub', subjectRouter)
app.use('*', routeError);

const port = process.env.PORT || 8080

app.listen (port, () => {
    console.log( `App is Running on Port ${port}` );

})