import express from "express"
import { uploadImage } from "../../middlewares/multer/fileUpload.js";
import { createTeacher, deleteTeacher, getOneTeacher, listTeachers, updateTeacher } from "../../controllers/v1/teacherController.js"

const teacherRouter = express.Router()

teacherRouter.post('/create',uploadImage.single('file'), createTeacher);
teacherRouter.get('/all', listTeachers);
teacherRouter.get('/:id', getOneTeacher);
teacherRouter.delete('/:id', deleteTeacher);
teacherRouter.put('/:id',uploadImage.single('file'), updateTeacher);

export default teacherRouter