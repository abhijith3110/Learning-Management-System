import express from 'express'
import { uploadImage } from '../../middlewares/multer/fileUpload.js'
import { createAdmin, deleteAdmin, GetOneAdmin, listAdmins, updateAdmin } from '../../controllers/v1/adminController.js'

const router = express.Router()

router.post('/admin/create',uploadImage.single('file'),createAdmin);
router.get('/admins', listAdmins);
router.get('/admin/:id', GetOneAdmin);
router.put('/admin/update/:id', uploadImage.single('file'), updateAdmin);
router.delete('/admin/delete/:id', deleteAdmin);

export default router