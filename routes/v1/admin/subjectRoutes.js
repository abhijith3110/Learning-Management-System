import express from "express"
import { createSubject, deleteSubject, getOneSubject, listAllSubjectsNames, listSubjects, updateSubject } from "../../../controllers/v1/admin/subjectController.js";
import { adminAuth } from "../../../middlewares/authCheck.js";


const subjectRouter = express.Router();

subjectRouter.use(adminAuth)

subjectRouter.post('/', createSubject)
subjectRouter.get('/names',listAllSubjectsNames)
subjectRouter.get('/all', listSubjects)
subjectRouter.get('/:id', getOneSubject)
subjectRouter.put('/:id', updateSubject)
subjectRouter.delete('/', deleteSubject)

export default subjectRouter 