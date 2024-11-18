import express from "express"
import { adminAuth } from '../../../middlewares/authCheck.js'
import { createAssignment, deleteAssignment, listAssignment } from "../../../controllers/v1/admin/assignmentController.js"

const assignmentRouter = express.Router()

assignmentRouter.use(adminAuth)

assignmentRouter.post('/',createAssignment)
assignmentRouter.get('/all',listAssignment)
assignmentRouter.delete('/:id',deleteAssignment)

export default assignmentRouter