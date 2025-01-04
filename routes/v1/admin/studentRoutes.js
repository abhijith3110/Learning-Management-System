import express from 'express'
import { createStudent, deleteStudent, getOneStudent, groupAllStudentsWithBatch, listStudents, updateStudent } from '../../../controllers/v1/admin/studentController.js'
import { adminAuth } from '../../../middlewares/authCheck.js'
import { uploadImage } from "../../../middlewares/multer/fileUpload.js";

const studentRouter = express.Router()

studentRouter.use(adminAuth)

studentRouter.post('/', uploadImage.single('file'), createStudent)
studentRouter.get('/names', groupAllStudentsWithBatch)
studentRouter.get('/all', listStudents)
studentRouter.get('/:id', getOneStudent)
studentRouter.put('/:id', updateStudent)
studentRouter.delete('/', deleteStudent)

export default studentRouter
