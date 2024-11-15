import express from "express";
import { connectDB } from "./configs/dbConfig.js";
import dotenv from "dotenv";
import adminRouter from "./routes/v1/admin/adminRoutes.js";
import subjectRouter from "./routes/v1/admin/subjectRoutes.js";
import teacherRouter from "./routes/v1/admin/teacherRoutes.js";
import batchRouter from "./routes/v1/admin/batchRoutes.js";
import { errorHandler, notFound } from "./middlewares/errorMiddlerware.js";
import studentRouter from "./routes/v1/admin/studentRoutes.js";
import lectureRouter from "./routes/v1/admin/lectureRoutes.js";
import { specs } from "./apidocs/swagger.js";
import swaggerUi from 'swagger-ui-express';
// import { routeError } from "./utils/routeError.js";
 
const app = express();

dotenv.config();

connectDB();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use(express.json());

app.get('/', ( req,res )=> {
    res.send('API IS RUNNING')
})

app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/subject', subjectRouter);
app.use('/api/v1/teacher', teacherRouter);
app.use('/api/v1/batch', batchRouter)
app.use('/api/v1/student', studentRouter)
app.use('/api/v1/lecture', lectureRouter)
app.use(notFound)
app.use(errorHandler)
/**app.use('*', routeError);*/

const port = process.env.PORT || 8080

app.listen (port, () => {
    console.log( `App is Running on Port ${port}` );

})