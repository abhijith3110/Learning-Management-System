import express from "express"
import {adminAuth} from "../../../middlewares/authCheck.js"
import  {createLecture}  from "../../../controllers/v1/admin/lectureController.js"

const lectureRouter = express.Router()

lectureRouter.use(adminAuth)

lectureRouter.post('/',createLecture)

export default lectureRouter