import express from "express"
import { createBatch, listBatches } from "../../controllers/v1/batchController.js"
import {adminAuth} from "../../middlewares/authCheck.js"
const BatchRouter = express.Router()

BatchRouter.use(adminAuth)

BatchRouter.post('/create', createBatch)
BatchRouter.get('/all', listBatches)

export default BatchRouter

