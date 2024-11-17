import express from "express"
import {adminAuth} from "../../../middlewares/authCheck.js"
import  {createLecture, deleteLecture, getOneLecture, listLecture, UpdateLecture}  from "../../../controllers/v1/admin/lectureController.js"

const lectureRouter = express.Router()

lectureRouter.use(adminAuth)

lectureRouter.post('/',createLecture)
lectureRouter.get('/all',listLecture)
lectureRouter.get('/:id',getOneLecture)
lectureRouter.put('/:id',UpdateLecture)
lectureRouter.delete('/:id',deleteLecture)

export default lectureRouter