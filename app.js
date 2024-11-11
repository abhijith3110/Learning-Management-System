import express from "express";
import { connectDB } from "./configs/dbConfig.js";
import dotenv from "dotenv";
import { routeError } from "./utils/routeError.js";
import adminRouter from "./routes/v1/adminRoutes.js";
import subjectRouter from "./routes/v1/subjectRoutes.js";
import teacherRouter from "./routes/v1/teacherRoutes.js";
import BatchRouter from "./routes/v1/batchRoutes.js";
import { errorHandler, notFound } from "./middlewares/errorMiddlerware.js";

const app = express();

dotenv.config();

connectDB();

app.use(express.json());

app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/subject', subjectRouter);
app.use('/api/v1/teacher', teacherRouter);
app.use('/api/v1/batch', BatchRouter)
app.use(notFound)
app.use(errorHandler)
/**app.use('*', routeError);*/

const port = process.env.PORT || 8080

app.listen (port, () => {
    console.log( `App is Running on Port ${port}` );

})