import teacherModel from "../../models/teacher.js"
import httpError from "../../utils/httpError.js"
import subjectModel from "../../models/subject.js";


/** Create Teacher */

export const createTeacher = async (req, res, next) => {

    try {

        const { first_name, last_name, email, password, gender, dob, phone, status, subject } = req.body;

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

        if (!first_name || !last_name || !email || !password || !gender || !dob || !phone || !status || !subject) {
            return next(new httpError("All fields are mantatory", 404))
        }

        try {

            const existingteacher = await teacherModel.findOne({ $or: [{ email }, { phone }] })

            if (existingteacher) {
                let errorMessage = existingteacher.email === email ? "A teacher with this email already exists" : "A teacher with this phone number already exists";
                return next(new httpError(errorMessage, 409));
            }

            // Ensure subject is always an array, even if only one subject is provided
            const subjectArray = Array.isArray(subject) ? subject : [subject];

            // Query the subjects in the database based on the array of subject IDs
            const subjectData = await subjectModel.find({ _id: { $in: subjectArray } });

            // Check if the number of subjects found matches the number provided
            if (subjectData.length !== subjectArray.length) {
                return next(new httpError("One or more subjects not found", 404));
            }

            const newTeacher = new teacherModel({ first_name, last_name, email, password, gender, dob, age: calculateAge(dob), phone, status, profile_image, subject })
            await newTeacher.save();
            res.status(201).json({ message: `${newTeacher.first_name + " " + newTeacher.last_name} (Teacher) created successfully` });

        } catch (error) {  

            if (error.name === 'ValidationError') {
                const errorMessage = Object.values(error.errors).map(err => err.message);
                return next(new httpError(errorMessage.join(","), 400))
            }

            return next(new httpError("Error saving Teacher data", 500));
        }


    } catch (error) {

        return next(new httpError("Failed to Upload Teacher Data. Please try again later", 500))
    }

}


/** list all teacher */

export const listTeachers = async (req, res, next) => {

    try {

        const teachers = await teacherModel.find().populate('subject');
        res.status(200).json(teachers)

    } catch (error) {

        return next(new httpError("Failed to get teacher list. Please try again later", 500));

    }

}


/** get One teacher */

export const getOneTeacher = async (req, res, next) => {

    try {

        const { id } = req.params

        if (!id) {

            return next(new httpError("Teacher ID required", 400));

        }

        const teacher = await teacherModel.findOne({ _id: id }).populate('subject')

        if (!teacher) {

            return next(new httpError("Teacher Not Found", 404));

        }

        res.status(200).json(teacher)

    } catch (error) {

        return next(new httpError("Failed to get teacher . Please try again later", 500));

    }

}


/** Update Teacher  */

export const updateTeacher = async (req, res, next) => {

    try {

        const { id } = req.params

        if ( !id ) {

            return next(new httpError("Teacher ID required", 400));
        }

        const { first_name, last_name, email, password, gender, dob, phone, status, subject } = req.body;


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


        const teacherData = { first_name, last_name, email, password, gender, dob, phone, status, subject };

        if (profileImage) {

            teacherData.profile_image = profileImage;
        }

        if (req.body.dob) {

            teacherData.age = calculateAge(dob);
        }

            const subjectArray = Array.isArray(subject) ? subject : [subject];

            const subjectData = await subjectModel.find({ _id: { $in: subjectArray } });

            if (subjectData.length !== subjectArray.length) {
                return next(new httpError("One or more subjects not found", 404));
            }


        try {

            const existingteacher = await teacherModel.findOne({ $or: [{ email }, { phone }], _id: { $ne: id } })

            if (existingteacher) {

                let errorMessage = existingteacher.email === email ? "A Teacher with this email already exists" : "A Teacher with this phone number already exists";
                return next(new httpError(errorMessage, 409));
            }

            const teacher = await teacherModel.findOneAndUpdate(
                { _id: id },
                { $set: teacherData },
                { new: true, runValidators: true }
            );

            if (teacher) {

                res.status(200).json({ message: `${teacher.first_name + " " + teacher.last_name} (Admin) Updated successfully` });

            } else {

                return next(new httpError("Teacher Not found", 404));
            }

        } catch (error) {

            if (error.name === 'ValidationError') {
                const errorMessage = Object.values(error.errors).map(err => err.message);
                return next(new httpError(errorMessage.join(", "), 400));
            }

            return next(new httpError("Failed to Update Admin. Please try again later", 500));

        }


    } catch (error) {

        return next(new httpError("Failed to Update teacher . Please try again later", 500));

    }

}


/** Delete Teacher */

export const deleteTeacher = async ( req, res, next ) => {

    try {

        const { id } = req.params

        if ( !id ) {

            return next(new httpError("Teacher ID required", 400));
        }

        const teacher = await teacherModel.findOneAndDelete( {_id: id} )

        if ( !teacher ) {

            return next(new httpError("Teacher not found", 404));

        }

        res.status(200).json({ message: "Teacher Deleted Successfully"})
        
    } catch (error) {
        
        return next(new httpError("Failed to Update teacher . Please try again later", 500));
    }
}