import studentModel from "../../../models/student.js"
import httpError from "../../../utils/httpError.js"
import batchModel from "../../../models/batch.js";
import bcrypt from 'bcrypt'

/** Create Student */

export const createStudent = async (req, res, next) => {

    try {

        const { first_name, last_name, email, password, gender, dob, phone, batch, address, parent_number, parent_name } = req.body;

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

        const generateStudentID = (firstName, phone, lastName) => {
            const firstLetter = firstName.slice(0, 2).toUpperCase();
            const lastLetter = lastName.charAt(0).toLowerCase();
            const phoneNo = phone.toString().slice(-3);
            const randomString = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            return `${firstLetter}${phoneNo}${lastLetter}${randomString}`;
        };

        const studentID = generateStudentID(first_name, phone, last_name);

        if (!first_name || !last_name || !email || !password || !gender
            || !dob || !phone || !batch || !address || !parent_number || !parent_name) {

            return next(new httpError("All fields are mantatory", 400))
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

        if (!emailRegex.test(email)) {

            return next(new httpError("Invalid email format", 404));
        }

        const validatePassword = (password) => {

            const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
            return regex.test(password);
        };

        if (!validatePassword(password)) {

            return next(new httpError("Password must be at least 6 characters long, include at least one uppercase letter, one number, and one special character", 404));
        }

        const validatePhoneNumber = (phone, parentPhone) => {

            if (phone === parentPhone) {

                return next(new httpError("Student phone number and parent's phone number cannot be the same", 404));
            }

            const phoneValid = /^\d{10}$/.test(phone?.toString());
            const parentPhoneValid = /^\d{10}$/.test(parentPhone?.toString());

            return phoneValid && parentPhoneValid;
        };

        if (!validatePhoneNumber(phone, parent_number)) {

            return next(new httpError("Phone number must be exactly 10 digits", 404));
        }

        const existingStudent = await studentModel.findOne({ $or: [{ email }, { phone }] })

        if (existingStudent) {

            return next(new httpError("A Student with this email or this phone is already exists", 404));
        }

        const isBatchExists = await batchModel.findOne({ _id: batch, "is_deleted.status": false });
 
        if (! isBatchExists) {

            return next(new httpError("Batch not Found or Batch is deleted ", 400));
        }


        const saltRounds = process.env.SALT_VALUE ? parseInt(process.env.SALT_VALUE) : 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newStudent = new studentModel({
            first_name,
            last_name,
            email,
            password: hashedPassword,
            gender,
            dob,
            age: calculateAge(dob),
            phone,
            profile_image,
            student_id: studentID,
            batch,
            address,
            parent_number,
            parent_name
        })

        await newStudent.save();
        res.status(201).json({
            message: `${newStudent.first_name + " " + newStudent.last_name} (Student) created successfully`,
            data: null,
            status: true,
            access_token: null
        });

    } catch (error) {

        if (error.name === 'ValidationError') {

            const errorMessage = Object.values(error.errors).map(err => err.message);
            return next(new httpError(errorMessage.join(","), 400))
        }
        console.log(error);
        return next(new httpError("Failed to Upload Student Data. Please try again later", 500))
    }

}


/** list all Student */

export const listStudents = async (req, res, next) => {

    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5
        const startIndex = (page - 1) * limit
        const searchQuery = req.query.search || ''
        const statusFilter = req.query.status || ''
        const BatchFilter = req.query.batch || ''

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
        if (BatchFilter) {

            filter.batch = BatchFilter;
        }

        const total = await studentModel.countDocuments(filter)

        const students = await studentModel.find(filter)
            .select('-is_deleted -password')
            .skip(startIndex).limit(limit)
            .sort({ createdAt: -1 })

            .populate({
                path: 'batch',
                select: '-is_deleted',
                populate: {
                    path: 'in_charge',
                    select: 'first_name last_name email status subject profile_image',

                    populate: {
                        path: 'subject',
                        select: 'name created_by updated_by',
                        populate: [
                            {
                                path: 'created_by',
                                select: 'first_name last_name email status role profile_image',
                            },
                            {
                                path: 'updated_by',
                                select: 'first_name last_name email status role profile_image',
                            },

                        ]
                    }
                }
            });

        res.status(200).json({
            message: '',
            data: students,
            status: true,
            access_token: null,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        })

    } catch (error) {

        return next(new httpError("Failed to get Students list. Please try again later", 500));

    }

}


/** group all students */

export const groupAllStudentsWithBatch = async (_req, res, next) => {
    try {
        const students = await studentModel.find({ "is_deleted.status": false })
            .select('first_name last_name profile_image')
            .populate({
                path: 'batch',
                select: 'name'
            }).sort({ createdAt: -1 });

        const groupedByBatch = students.reduce((acc, student) => {
            const batchName = student.batch?.name || 'Unknown Batch';
            if (!acc[batchName]) {
                acc[batchName] = [];
            }
            acc[batchName].push(student);
            return acc;
        }, {});

        res.status(200).json({
            data: groupedByBatch,
            message: '',
            status: true,
            access_token: null
        });

    } catch (error) {
        
        return next(new httpError("Failed to group Students. Please try again later", 500));
    }
};




/** get One Student */

export const getOneStudent = async (req, res, next) => {

    try {

        const { id } = req.params

        if (!id) {

            return next(new httpError("Student ID required", 400));
        }

        const student = await studentModel.findOne({ _id: id })
            .select('-is_deleted -password')
            .populate({
                path: 'batch',
                select: '-is_deleted',
                populate: {
                    path: 'in_charge',
                    select: 'first_name last_name email status subject profile_image',

                    populate: {
                        path: 'subject',
                        select: 'name created_by updated_by',
                        populate: [
                            {
                                path: 'created_by',
                                select: 'first_name last_name email status role profile_image',
                            },
                            {
                                path: 'updated_by',
                                select: 'first_name last_name email status role profile_image',
                            },

                        ]
                    }
                }
            });

        if (!student) {

            return next(new httpError("Student Not Found", 404));
        }

        res.status(200).json({
            message: '',
            data: student,
            status: true,
            access_token: null
        })

    } catch (error) {

        return next(new httpError("Failed to get Student . Please try again later", 500));
    }

}


// /** Update Student  */

export const updateStudent = async (req, res, next) => {

    try {

        const { id } = req.params

        if (! id) {

            return next(new httpError("Student ID required", 400));
        }

        const {  first_name, last_name, email, password, gender, dob, phone, status, batch, address, parent_number  } = req.body;


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


        const studentData = { first_name, last_name, email, password, gender, dob, phone, status, batch, address, parent_number  };

        if (profileImage) {

            studentData.profile_image = profileImage;
        }

        if (dob) {

            studentData.age = calculateAge(dob);
        }

        const existingStudent = await studentModel.findOne({ $or: [{ email }, { phone }], _id: { $ne: id } })

        if (existingStudent) {

            return next(new httpError("A Student with this email or this Phone number is already exists", 409));
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

        if (email && ! emailRegex.test(email)) {

            return next(new httpError("Invalid email format!", 400));
        }

        const validatePassword = (password) => {

            const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
            return regex.test(password);
        };

        if ( password && ! validatePassword(password)) {

            return next(new httpError("Password must be at least 6 characters long, include at least one uppercase letter, one number, and one special character", 400));
        }

        const validatePhoneNumber = (phone, parentPhone) => {

            if (phone === parentPhone) {

                return next(new httpError("Student phone number and parent's phone number cannot be the same", 400));
            }

            const phoneValid = /^\d{10}$/.test(phone?.toString());
            const parentPhoneValid = /^\d{10}$/.test(parentPhone?.toString());

            return phoneValid && parentPhoneValid;
        };

        if (phone && ! validatePhoneNumber(phone, parent_number)) {

            return next(new httpError("Phone number must be exactly 10 digits", 400));
        }

        const isBatchExists = await batchModel.findOne({ _id: batch, "is_deleted.status": false });
 
        if ( batch && ! isBatchExists) {

            return next(new httpError("Batch not Found or Batch is deleted ", 404));
        }

        if (password) {

            const saltRounds = process.env.SALT_VALUE ? parseInt(process.env.SALT_VALUE) : 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            studentData.password = hashedPassword;
        }

        const student = await studentModel.findOneAndUpdate(
            { _id: id },
            { $set: studentData },
            { new: true, runValidators: true }
        );

        if (student) {

            res.status(200).json({ 
                message: `${student.first_name + " " + student.last_name} (Student) Updated successfully`,
                data: null,
                status: true,
                access_token: null
             });

        } else {

            return next(new httpError("Student Not found", 404));
        }

    } catch (error) {

        if (error.name === 'ValidationError') {
            const errorMessage = Object.values(error.errors).map(err => err.message);
            return next(new httpError(errorMessage.join(", "), 400));
        }

        console.log(error);
        
        return next(new httpError("Failed to Update Student . Please try again later", 500));
    }

}


// /** Delete Student */

export const deleteStudent = async (req, res, next) => {

    try {
  
      const { ids } = req.body;
  
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
  
        return next(new httpError("Student ID is required", 400));
      }
  
      const adminID = req.user?.id;
  
      if (!adminID) {
  
        return next(new httpError("Unauthorized action", 403));
      }
  
      const student = await studentModel.updateMany(
        { _id: { $in: ids }, "is_deleted.status": false },
  
        {
          $set: {
            "is_deleted.status": true,
            "is_deleted.deleted_by": adminID,
            "is_deleted.deleted_at": new Date(),
          },
        },
  
        { new: true }
      );
  
      if (student.matchedCount === 0) {
  
        return next(new httpError("No student found or already deleted", 404));
      }
  
      res.status(200).json({
        message: "student deleted successfully",
        data: null,
        status: true,
        access_token: null,
      });
  
    } catch (error) {
  
      return next(new httpError("Failed to delete student. Please try again later", 500));
    }
    
  };