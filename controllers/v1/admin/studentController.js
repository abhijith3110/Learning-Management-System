import studentModel from "../../../models/student.js"
import httpError from "../../../utils/httpError.js"
import batchModel from "../../../models/batch.js";


/** Create Student */

export const createStudent = async ( req, res, next ) => {

    try {

        const { first_name, last_name, email, password, gender, dob, phone, status, batch } = req.body;

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

        const generateStudentID = (firstName) => {
            const firstLetter = firstName.toUpperCase(); 
            const timestamp = Date.now().toString(36).slice(-5); 
            const randomString = Math.random().toString(36).substring(2, 8); 
            return `${firstLetter}${timestamp}${randomString}`;
        };

        const studentID = generateStudentID(req.body.first_name);



        if (!first_name || !last_name || !email || !password || !gender || !dob || !phone || !status || !batch ) {
            return next(new httpError("All fields are mantatory", 404))
        }

        try {

            const existingStudent = await studentModel.findOne({ $or: [{ email }, { phone }] })

            if (existingStudent) {
                let errorMessage = existingStudent.email === email ? "A Student with this email already exists" : "A Student with this phone number already exists";
                return next(new httpError(errorMessage, 409));
            }

            const isBatchExists = await batchModel.findById( batch );

            if (!isBatchExists) {

                return next(new httpError("Batch not Found", 404));
            }

            const newStudent = new studentModel({ first_name, last_name, email, password, gender, dob, age: calculateAge(dob), phone, status, profile_image, student_id: studentID, batch })
            await newStudent.save();
            res.status(201).json({ message: `${newStudent.first_name + " " + newStudent.last_name} (Student) created successfully` });

        } catch (error) {  

            if (error.name === 'ValidationError') {
                const errorMessage = Object.values(error.errors).map(err => err.message);
                return next(new httpError(errorMessage.join(","), 400))
            }

            return next(new httpError("Error saving Student data", 500));
        }


    } catch (error) {

        return next(new httpError("Failed to Upload Student Data. Please try again later", 500))
    }

}


/** list all Student */

export const listStudents = async ( req, res, next ) => {

    try {

        const students = await studentModel.find({ "isDeleted.status": false }).populate('batch');
            
        res.status(200).json(students)

    } catch (error) {

        return next(new httpError("Failed to get Students list. Please try again later", 500));

    }

}


/** get One Student */

export const getOneStudent = async ( req, res, next ) => {

    try {

        const { id } = req.params

        if (!id) {

            return next(new httpError("Student ID required", 400));

        }

        const student = await studentModel.findOne({ _id: id }).populate('batch')

        if (!student) {

            return next(new httpError("Student Not Found", 404));

        }

        res.status(200).json(student)

    } catch (error) {

        return next(new httpError("Failed to get Student . Please try again later", 500));

    }

}


// /** Update Student  */

export const updateStudent = async (req, res, next) => {

    try {

        const { id } = req.params

        if ( !id ) {

            return next(new httpError("Student ID required", 400));
        }

        const { first_name, last_name, email, password, gender, dob, phone, status, batch } = req.body;


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


        const studentData = { first_name, last_name, email, password, gender, dob, phone, status, batch };

        if (profileImage) {

            studentData.profile_image = profileImage;
        }

        if (req.body.dob) {

            studentData.age = calculateAge(dob);
        }


        try {

            const existingStudent = await studentModel.findOne({ $or: [{ email }, { phone }] })

            if (existingStudent) {
                let errorMessage = existingStudent.email === email ? "A Student with this email already exists" : "A Student with this phone number already exists";
                return next(new httpError(errorMessage, 409));
            }
    

            if ( req.body.batch) {

                const isBatchExists = await batchModel.findById( batch );
    
                if (!isBatchExists) {
        
                    return next(new httpError("Batch not Found", 404));
                }
            }

            const student = await studentModel.findOneAndUpdate(
                { _id: id },
                { $set: studentData },
                { new: true, runValidators: true }
            );

            if (student) {

                res.status(200).json({ message: `${student.first_name + " " + student.last_name} (Student) Updated successfully` });

            } else {

                return next(new httpError("Student Not found", 404));
            }

        } catch (error) {

            if (error.name === 'ValidationError') {
                const errorMessage = Object.values(error.errors).map(err => err.message);
                return next(new httpError(errorMessage.join(", "), 400));
            }

            return next(new httpError("Failed to Update Student. Please try again later", 500));

        }


    } catch (error) {

        return next(new httpError("Failed to Update Student . Please try again later", 500));

    }

}


// /** Delete Student */

export const deleteStudent = async ( req, res, next ) => {

    const { id } = req.params
    const admin = req.admin.id
    
    if ( !id ) {
        
        return next(new httpError("Student ID required", 400));
    }
    
    try {

        const student = await studentModel.findOneAndUpdate( 

            {_id: id, "isDeleted.status": false},
            
            { $set: 
                {
                    "isDeleted.status": true,
                    "isDeleted.deleted_by": admin,
                    "isDeleted.deleted_at": new Date()
                },

            },

            { new: true }
         )

        if ( !student ) {

            return next(new httpError("Student not found", 404));

        }

        res.status(200).json({ message: "Student Deleted Successfully"})
        
    } catch (error) {
        
        return next(new httpError("Failed to delete Student . Please try again later", 500));
    }
}