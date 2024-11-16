import express from "express"
import { adminAuth } from '../../../middlewares/authCheck.js'
import { createQuestion, deleteQuestion, getOneQuestion, listQuestions, updateQuestion } from "../../../controllers/v1/admin/questionController.js"

const QuestionRouter = express.Router()

QuestionRouter.use(adminAuth)

QuestionRouter.post('/',createQuestion)
QuestionRouter.get('/all',listQuestions)
QuestionRouter.get('/:id',getOneQuestion)
QuestionRouter.put('/:id',updateQuestion)
QuestionRouter.delete('/:id',deleteQuestion)

export default QuestionRouter 