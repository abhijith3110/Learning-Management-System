import express from "express"
import { createSubject, deleteSubject, getOneSubject, listSubjects, updateSubject } from "../../controllers/v1/subjectController.js";
import { adminAuth } from "../../middlewares/authCheck.js";


const subjectRouter = express.Router();

subjectRouter.use(adminAuth)

subjectRouter.post('/create', createSubject)
subjectRouter.get('/all', listSubjects)
subjectRouter.get('/:id', getOneSubject)
subjectRouter.put('/:id', updateSubject)
subjectRouter.delete('/:id', deleteSubject)

export default subjectRouter 