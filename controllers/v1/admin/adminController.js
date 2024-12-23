import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import adminModel from '../../../models/admin.js'
import httpError from '../../../utils/httpError.js'
import { adminRoleObj } from '../../../configs/adminConfig.js'


/** LOGIN ADMIN */

export const loginAdmin = async (req, res, next) => {

    try {

        const { email, password } = req.body;

        if (! email || ! password) {

            return next(new httpError("Email and password are required", 400));
        }

        const admin = await adminModel.findOne({ email, "is_deleted.status": false, status: "active" });

        if (! admin) {

            return next(new httpError("Invalid email or password", 401));
        }

        const isPasswordCorrect = await bcrypt.compare(password, admin.password)

        if (! isPasswordCorrect) {

            return next(new httpError("Invalid email or password", 401));
        }

        const jwtSecret = process.env.JWT_SECRET;

        if (! jwtSecret) {

            return next(new httpError("Server error: Missing JWT secret", 500));
        }

        const token = jwt.sign(
            { id: admin._id, role: admin.role },
            jwtSecret,
            { expiresIn: process.env.JWT_TOKEN_EXPIRY }
        );

        res.status(200).json({
            message: "Login successful",
            access_token: token,
            status: true,
            data: null
        });

    } catch (error) {

        return next(new httpError("Failed to login. Please try again later", 500));
    }

}


/** Create Admin */

export const createAdmin = async (req, res, next) => {
    try {
        const superAdminRole = adminRoleObj.SUPERADMIN;

        if (req.user.role !== superAdminRole) {
            return next(new httpError("Only Super Admin can create admins", 403));
        }

        const { first_name, last_name, email, password, gender, dob, phone, status, role } = req.body;

        if (!first_name || !last_name || !email || !password || !gender || !dob || !phone || !status || !role) {
            return next(new httpError("All fields are mandatory", 400));
        }

        const profile_image = req.file?.path?.slice(8);

        const calculateAge = (dob) => {
            const today = new Date();
            const birthDate = new Date(dob);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            return age;
        };

        const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if (!emailRegex.test(email)) {
            return next(new httpError("Invalid email format!", 400));
        }

        const validatePassword = (password) => {
            const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
            return regex.test(password);
        };

        if (!validatePassword(password)) {
            return next(new httpError("Password must be at least 6 characters long, include at least one uppercase letter, one number, and one special character", 400));
        }

        const validatePhoneNumber = (phone) => {
            return /^\d{10}$/.test(phone?.toString());
        };

        if (!validatePhoneNumber(phone)) {
            return next(new httpError("Phone number must be exactly 10 digits", 400));
        }

        const existingAdmin = await adminModel.findOne({ $or: [{ email }, { phone }] });
        if (existingAdmin) {
            return next(new httpError("An admin with this email or phone number already exists", 409));
        }

        const saltRounds = parseInt(process.env.SALT_VALUE || "10", 10);
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newAdmin = new adminModel({
            first_name,
            last_name,
            email,
            password: hashedPassword,
            gender,
            dob,
            age: calculateAge(dob),
            phone,
            status,
            role,
            profile_image
        });

        await newAdmin.save();

        res.status(201).json({
            message: `${newAdmin.first_name} ${newAdmin.last_name} (${newAdmin.role}) created successfully`,
            status: true,
            data: null,
            access_token: null
        });
        
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errorMessage = Object.values(error.errors).map(err => err.message).join(", ");
            return next(new httpError(errorMessage, 400));
        }

        console.error(error);
        return next(new httpError("Failed to create admin. Please try again later", 500));
    }
};


/** list All Admins */

export const listAdmins = async (req, res, next) => {

    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5
        const startIndex = (page - 1) * limit
        const searchQuery = req.query.search || ''
        const statusFilter = req.query.status || ''
        const genderFilter = req.query.gender || ''

        const searchRegex = new RegExp(searchQuery, 'i')

        const filter = {
            "is_deleted.status": false,
            $or: [
                { first_name: { $regex: searchRegex } },
                { last_name: { $regex: searchRegex } },
                { email: { $regex: searchRegex } }
            ]
        };

        if (statusFilter) {

            filter.status = statusFilter;
        }

        if (genderFilter) {

            filter.gender = genderFilter;
        }
        
        const total = await adminModel.countDocuments(filter)

        const admins = await adminModel.find(filter)
            .select('-password -is_deleted -__v')
            .skip(startIndex).limit(limit)
            .sort({ createdAt: -1 })

        res.status(200).json({
            message: '',
            status: true,
            access_token: null,
            data: admins,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        });

    } catch (error) {

        return next(new httpError("Failed to get Admin list. Please try again later", 500));
    }

}


/** Get One Amdin */

export const GetOneAdmin = async (req, res, next) => {

    try {

        const { id } = req.params;

        if (! id) {

            return next(new httpError("Admin ID Required", 400));
        }

        const admin = await adminModel.findOne({ _id: id }).select('-password -is_deleted -createdAt -updatedAt -__v');

        if (! admin) {

            return next(new httpError("Admin Not Found", 404));
        }

        res.status(200).json({ message: '', data: admin, status: true, access_token: null });

    } catch (error) {

        return next(new httpError('Failed to get Admin. Please try again later', 500))
    }

}

/** Update Admin */

export const updateAdmin = async (req, res, next) => {

    try {

        const superadmin = adminRoleObj.SUPERADMIN

        if (req.user.role !== superadmin) {

            return next(new httpError("Only Super Admin can Update Admins or Super admins", 403))
        }

        const { id } = req.params;

        if (! id) {

            return next(new httpError("Admin ID Required", 400));
        }

        const { first_name, last_name, email, password, gender, dob, phone, status, role } = req.body;

        let profileImage

        if (req.file && req.file.path) {

            profileImage = req.file.path.slice(8);
        }

        function calculateAge(dob) {

            const today = new Date()
            const birthDate = new Date(dob)
            let ageCalculate = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (monthDiff < 0 || monthDiff === 0 && today.getDate() < birthDate.getDate()) {

                ageCalculate--;
            }

            return ageCalculate
        }

        const validatePassword = (password) => {

            const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
            return regex.test(password);
        };

        const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

        if (req.body.email && ! emailRegex.test(email)) {

            return next(new httpError("Invalid email format!", 400));
        }

        if (req.body.password && ! validatePassword(password)) {

            return next(new httpError("Password must be at least 6 characters long, include at least one uppercase letter, one number, and one special character", 400));
        }

        const validatePhoneNumber = (phone) => {

            return /^\d{10}$/.test(phone?.toString());
        };

        if (req.body.phone && ! validatePhoneNumber(phone)) {

            return next(new httpError("Phone number must be exactly 10 digits", 400));
        }

        const adminData = { first_name, last_name, email, password, gender, dob, phone, status, role };

        if (profileImage) {

            adminData.profile_image = profileImage;
        }

        if (req.body.dob) {

            adminData.age = calculateAge(dob);
        }

        if (req.body.password) {

            const saltRounds = process.env.SALT_VALUE ? parseInt(process.env.SALT_VALUE) : 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            adminData.password = hashedPassword;
        }

        const existingAdmin = await adminModel.findOne({ $or: [{ email }, { phone }], _id: { $ne: id } })

        if (existingAdmin) {

            return next(new httpError('An admin with this email or this Phone Number already exists', 409));
        }

        const admin = await adminModel.findOneAndUpdate(
            { _id: id },
            { $set: adminData },
            { new: true, runValidators: true }
        );

        if (! admin) {

            return next(new httpError("Admin not found", 404));
        }

        res.status(200).json({ 
            message: `${admin.first_name + " " + admin.last_name} (${admin.role}) Updated successfully`,
            data: null,
            status: true,
            access_token: null
         });

    } catch (error) {

        if (error.name === 'ValidationError') {

            const errorMessage = Object.values(error.errors).map(err => err.message);
            return next(new httpError(errorMessage.join(", "), 400));
        }

        return next(new httpError("Failed to Update Admin. Please try again later", 500));
    }

}


/** Delete Admin */

export const deleteAdmin = async (req, res, next) => {

    try {

        const superadmin = adminRoleObj.SUPERADMIN;

        if (req.user.role !== superadmin) {

            return next(new httpError("Only Super Admin can delete admins or superadmins", 403));
        }

        const { id } = req.params;

        if (! id) {

            return next(new httpError("Admin ID is required", 400));
        }

        const adminID = req.user?.id

        if (! adminID) {

            return next(new httpError("Unauthorized action", 403));
        }

        const admin = await adminModel.findOneAndUpdate(
            { _id: id, "is_deleted.status": false },

            {
                $set: {
                    "is_deleted.status": true,
                    "is_deleted.deleted_by": adminID,
                    "is_deleted.deleted_at": new Date(),
                },
            },

            { new: true }
        );

        if (! admin) {

            return next(new httpError("Admin not found or already deleted", 404));
        }

        res.status(200).json({ 
            message: "Admin deleted successfully",
            data: null,
            status: true,
            access_token: null
         });

    } catch (error) {

        return next(new httpError("Failed to delete admin. Please try again later", 500));
    }

};
