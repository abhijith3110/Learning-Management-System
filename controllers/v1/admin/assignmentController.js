import Assignment from "../../../models/assignment.js";
import Lecture from "../../../models/lecture.js";
import httpError from "../../../utils/httpError.js"
import adminModel from "../../../models/admin.js"
import Question from "../../../models/question.js"

/** create assignment */

export const createAssignment = async (req, res, next) => {

    try {
        
        const {status, lecture, last_date, questions} = req.body

        if (! status || ! lecture || ! last_date || ! questions) {

            return next(new httpError("All fields are Mandatory",400))
        }

        const isLecture = await Lecture.findOne({ _id: lecture, "is_deleted.status": false })

        if (! isLecture) {

            return next(new httpError("Lecture not found",404))
        }

        const isQuestion = await Question.find({ _id: { $in: questions }, "is_deleted.status": false });

        if (isQuestion.length !== questions.length) {

            return next(new httpError("One or more Questions are not found or deleted.", 404));
        }
        
        const lastDate = new Date(req.body.last_date);
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        
        if (lastDate < today) {
            return next(new httpError("Assignment cannot be created in the past.", 400));
        }
        
        
        const CreatedBy = req.user.id

        const newAssignment = new Assignment({status, lecture, last_date, created_by: CreatedBy, questions})
        await newAssignment.save()

        res.status(201).json({
            message: "Assignment created Successfully",
            data: null,
            status: true,
            access_token: null
        })


    } catch (error) {

         return next(new httpError("Failed to Create Assignment. Please try again.", 500))
    }

}

/** list Assignment */

export const listAssignment = async (req, res, next) => {

    try {
        
        const assignments = await Assignment.find({ "is_deleted.status": false })
        .select('-is_deleted')
        .populate([
            
            {
                path: 'created_by',
                select: 'first_name last_name email subject status',
            },
            {
                path: 'updated_by',
                select: 'first_name last_name email subject status role',
            },
            {
                path: 'lecture',
                select: '-is_deleted',
                populate: [
                    {
                        path: 'subject',
                        select: 'name',
                    },
                    {
                        path: 'batch',
                        select: 'name in_charge',
                        populate: {
                            path: 'in_charge',
                            select: 'first_name last_name email subject status',
                            populate: {
                                path: 'subject',
                                select: 'name',
                            },
                        },
                    },
                    {
                        path: 'teacher',
                        select: 'first_name last_name email subject status',
                        populate: {
                            path: 'subject',
                            select: 'name',
                        },
                    },
                    {
                        path: 'attendees',
                        select: 'first_name last_name email status student_id',
                    },
                ],
            },

            {
                path: 'questions',
                select: '-is_deleted',
            },
        ]);
    
        res.status(200).json({
            message: '',
            data: assignments,
            status: true,
            access_token: null
        })

    } catch (error) {
        console.log(error);
        
        return next(new httpError("Failed to List Assignments. Please try again.", 500))
    }

}

/** Get one Assignment */

// export const getOneAssignment = (req, res, next) => {

//     try {
        
//         const {id} = req.params

//         if (! id) {

//             return next(new httpError("Assignment ID required", 400))
//         }



//     } catch (error) {

//         return next(new httpError("Failed to get assignment. Please try again.", 500))
//     }
// }


/** Delete Assignment */ 

export const deleteAssignment = async (req, res, next) => {

    try {

        const { id } = req.params
        const user = req.user.id

        if (! id) {

            return next(new httpError("Assignment ID required ", 400))
        }

        const assignment = await Assignment.findOneAndUpdate(

            { _id: id, "is_deleted.status": false },

            {
                $set:
                {
                    "is_deleted.status": true,
                    "is_deleted.deleted_by": user,
                    "is_deleted.deleted_at": new Date()
                }
            },

            { new: true }
        )

        if (! assignment) {

            return next(new httpError("assignment not found", 404))

        } else {

            res.status(200).json({
                message: "assignment deleted successfully",
                data: null,
                status: true,
                access_token: null
            })
        }

    } catch (error) {

        return next(new httpError("Failed to delete assignment. Please try again.", 500))
    }

}

