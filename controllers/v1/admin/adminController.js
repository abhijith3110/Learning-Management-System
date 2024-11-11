import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import adminModel from '../../../models/admin.js'
import httpError from '../../../utils/httpError.js'
import {adminRoleObj} from '../../../configs/adminConfig.js'


const JWT_SECRET = process.env.JWT_SECRET || "2#2!2*2@";
const superadmin = adminRoleObj.SUPERADMIN

/** LOGIN ADMIN */


export const loginAdmin = async ( req, res, next ) => {

    try {
        
        const { email, password } = req.body;
        
        if ( !email || !password ) {

            return next(new httpError("Email and password are required", 400));
        }

        const admin = await adminModel.findOne({ email })

        if (!admin) {

            return next(new httpError("Invalid email or password", 401));
        }

        const isPasswordCorrect = await bcrypt.compare(password,admin.password)

        if (!isPasswordCorrect) {

            return next(new httpError("Invalid email or password", 401));
        }

        const token =  jwt.sign( {id: admin._id, role: admin.role }, JWT_SECRET, { expiresIn: "1h" } );

        res.status(200).json({ message: "Login successful", token });

    } catch (error) {

        return next(new httpError("Failed to login. Please try again later", 500));

    }

}


/** Create Admin */

export const createAdmin = async (req, res, next) => {

    if (superadmin === req.admin.role) {

        try {

            const { first_name, last_name, email, password, gender, dob, phone, status, role } = req.body;
    
            let profile_image
    
            if (req.file && req.file.path) {
                profile_image = req.file.path.slice(8);
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
    
    
            if (!first_name || !last_name || !email || !password || !gender || !dob || !phone || !status || !role) {
                return next(new httpError("All fields are mantatory", 404))
            }
    
    
            try {
    
                const existingAdmin = await adminModel.findOne({ $or: [{ email }, { phone }] })
    
                if (existingAdmin) {
                    let errorMessage = existingAdmin.email === email ? "An admin with this email already exists" : "An admin with this phone number already exists";
                    return next(new httpError(errorMessage, 409));
                }
    
                const hashedPassword = await bcrypt.hash(password, 10);
    
                const adminCreate = new adminModel({ first_name, last_name, email, password: hashedPassword, gender, dob, age: calculateAge(dob), phone, status, role, profile_image })
                await adminCreate.save();
                res.status(201).json({ message: `${adminCreate.first_name + " "+ adminCreate.last_name} (Admin) created successfully` });
    
            } catch (error) {
    
                if (error.name === 'ValidationError') {
                    const errorMessage = Object.values(error.errors).map(err => err.message);
                    return next(new httpError(errorMessage.join(","), 400))
                }
    
                return next(new httpError("Error saving admin data", 500));
            }
    
        } catch (error) {
            return next(new httpError("Failed to Upload Amdin. Please try again later", 500))
    
        }

    } else {

        return next(new httpError("Only Super Admin can Create Admins", 500))
    }

}

/** list All Admins */

export const listAdmins = async (req, res, next) => {

    try {

        const admins = await adminModel.find();
        res.status(200).json(admins);

    } catch (error) {

        return next(new httpError("Failed to get Admin list. Please try again later", 500));

    }

}


/** Get One Amdin */

export const GetOneAdmin = async (req, res, next) => {

    try {

        const { id } = req.params;

        if (id) {

            const admin = await adminModel.findOne({ _id: id });

            if (admin) {

                res.status(200).json( admin );

            } else {

                return next(new httpError("Admin Not Found", 404));
            }

        } else {

            return next(new httpError("Admin ID Required", 400));

        }

    } catch (error) {

        return next(new httpError(`Failed to get user with ID ${req.params.id}. Please try again later`, 500))
    }

}

/** Update Admin */

export const updateAdmin = async (req, res, next) => {

    if (req.admin.role === superadmin) {

        try {

            const { id } = req.params;
    
            if (id) {
    
                const { first_name, last_name, email, password, gender, dob, phone, status } = req.body;
    
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
    
                const adminData = { first_name, last_name, email, password, gender, dob, phone, status };
    
                if (profileImage) {
                    adminData.profile_image = profileImage;
                }
    
                if (req.body.dob) {
                    adminData.age = calculateAge(dob);
                }
    
    
                try {
    
                    const existingAdmin = await adminModel.findOne({ $or: [{ email }, { phone }], _id: { $ne: id }  })
    
                    if (existingAdmin) {
    
                        let errorMessage = existingAdmin.email === email ? "An admin with this email already exists" : "An admin with this phone number already exists";
                        return next(new httpError(errorMessage, 409));
                    }
    
                    const admin = await adminModel.findOneAndUpdate(
                        { _id: id },
                        { $set: adminData },
                        { new: true, runValidators: true }
                    );
    
                    if (admin) {
    
                        res.status(200).json({ message: `${admin.first_name + " "+ admin.last_name} (Admin) Updated successfully` });
    
                    } else {
    
                        return next(new httpError("Admin Not found", 404));
                    }
    
                } catch (error) {
    
                    if (error.name === 'ValidationError') {
                        const errorMessage = Object.values(error.errors).map(err => err.message);
                        return next(new httpError(errorMessage.join(", "), 400));
                    }
    
                    return next(new httpError("Failed to Update Admin. Please try again later", 500));
    
                }
    
            } else {
    
                return next(new httpError("Admin ID Required", 400));
            }
    
        } catch (error) {
    
            return next(new httpError('Internal server error', 500))
        }

        
    } else {

        return next( new httpError("Only Super Admin can Update Admins or Super admins", 500) )

    }

}


/** Delete Admin */


export const deleteAdmin = async ( req, res, next ) => {

    if(superadmin === req.admin.role) {

        try {

            const { id } = req.params;
    
            if (id) {
                
                const admin =  await adminModel.findOneAndDelete( { _id: id } )
    
                if (admin) {
    
                    res.status(200).json({ message: "Admin Deleted Successfully"})
    
                } else {
                    
                    return next( new httpError("Admin Not Found",404) )
                }
                
            } else {
                
                return next( new httpError("Admin ID Required",400) )
            }
            
        } catch (error) {
            
            return next( new httpError("Failed to delete Admin. Please try again later", 500) )
        }

    } else {

        return next( new httpError("Only Super Admin can Delete Admins or Super admins", 500) )
    }
}


