import express, { application } from 'express'
import { createStudent, deleteStudent, getOneStudent, listStudents, updateStudent } from '../../../controllers/v1/admin/studentController.js'
import { adminAuth } from '../../../middlewares/authCheck.js'

const studentRouter = express.Router()

studentRouter.use(adminAuth)

studentRouter.post('/', createStudent)
studentRouter.get('/all', listStudents)
studentRouter.get('/:id', getOneStudent)
studentRouter.put('/:id', updateStudent)
studentRouter.delete('/:id', deleteStudent)

export default studentRouter