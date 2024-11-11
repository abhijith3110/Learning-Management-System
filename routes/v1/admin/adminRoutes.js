import express from 'express'
import { uploadImage } from '../../../middlewares/multer/fileUpload.js'
import { createAdmin, deleteAdmin, GetOneAdmin, listAdmins, loginAdmin, updateAdmin } from '../../../controllers/v1/admin/adminController.js'
import { adminAuth } from '../../../middlewares/authCheck.js'

const adminRouter = express.Router()

adminRouter.post('/login', loginAdmin)

adminRouter.use(adminAuth)

adminRouter.post('/', uploadImage.single('file'),createAdmin);
adminRouter.get('/all', listAdmins);
adminRouter.get('/:id', GetOneAdmin);
adminRouter.put('/:id', uploadImage.single('file'), updateAdmin);
adminRouter.delete('/:id', deleteAdmin);

export default adminRouter