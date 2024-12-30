import express from 'express'
import { uploadImage } from '../../../middlewares/multer/fileUpload.js'
import { createAdmin, deleteAdmin, GetOneAdmin, listAdmins, loginAdmin, updateAdmin } from '../../../controllers/v1/admin/adminController.js'
import { adminAuth } from '../../../middlewares/authCheck.js'

const adminRouter = express.Router()

/**
 * @swagger
 * /api/v1/admin/login:
 *   post:
 *     summary: Logs in an admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
adminRouter.post('/login', loginAdmin)
adminRouter.use(adminAuth)

adminRouter.get('/all', listAdmins);
adminRouter.post('/', uploadImage.single('file'),createAdmin);

adminRouter.get('/:id', GetOneAdmin);
adminRouter.put('/:id', uploadImage.single('file'), updateAdmin);

/**
 * @swagger
 * /api/v1/admin/{id}:
 *   delete:
 *     summary: Deletes an admin
 *     description: Deletes an admin by ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The admin ID
 *     responses:
 *       200:
 *         description: Admin deleted successfully
 *       404:
 *         description: Admin not found
 */
adminRouter.delete('/:id', deleteAdmin);

export default adminRouter