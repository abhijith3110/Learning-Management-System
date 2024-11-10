import express from 'express'
import { uploadImage } from '../../middlewares/multer/fileUpload.js'
import { createAdmin, deleteAdmin, GetOneAdmin, listAdmins, updateAdmin } from '../../controllers/v1/adminController.js'

const adminRouter = express.Router()

adminRouter.post('/create',uploadImage.single('file'),createAdmin);
adminRouter.get('/all', listAdmins);
adminRouter.get('/:id', GetOneAdmin);
adminRouter.put('/update/:id', uploadImage.single('file'), updateAdmin);
adminRouter.delete('/delete/:id', deleteAdmin);

export default adminRouter