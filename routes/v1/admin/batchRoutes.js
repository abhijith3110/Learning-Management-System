import express from "express"
import { createBatch, deleteBatch, getOneBatch, listAllBatchesNames, listBatches, updateBatch } from "../../../controllers/v1/admin/batchController.js"
import {adminAuth} from "../../../middlewares/authCheck.js"
const batchRouter = express.Router()

batchRouter.use(adminAuth)

batchRouter.post('/', createBatch)
batchRouter.get('/names', listAllBatchesNames)
batchRouter.get('/all', listBatches)
batchRouter.get('/:id', getOneBatch)
batchRouter.put('/:id', updateBatch)
batchRouter.delete('/', deleteBatch)

export default batchRouter


