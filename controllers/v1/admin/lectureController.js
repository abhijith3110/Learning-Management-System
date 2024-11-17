import Lecture from "../../../models/lecture.js";
import httpError from "../../../utils/httpError.js"
import subjectModel from "../../../models/subject.js"
import teacherModel from "../../../models/teacher.js"
import batchModel from "../../../models/batch.js"
import studentModel from "../../../models/student.js"

/** Create Lecture */

export const createLecture = async (req, res, next) => {

    try {

        const { duration, status, subject, teacher, batch, attendees, link, notes } = req.body

        if (!duration || !status || !subject || !teacher || !batch || !attendees) {

            return next(new httpError("All fields are Mandatory", 400))
        }

        if (!duration.from || !duration.to) {

            return next(new httpError("Duration with from and to times is required.", 400))
        }

        const fromDate = new Date(duration.from);
        const toDate = new Date(duration.to);

        if (isNaN(fromDate) || isNaN(toDate)) {

            return next(new httpError("Invalid date format for duration.", 400));
        }

        const isSameDay =
            fromDate.getFullYear() === toDate.getFullYear() &&
            fromDate.getMonth() === toDate.getMonth() &&
            fromDate.getDate() === toDate.getDate();

        if (!isSameDay) {

            return next(new httpError("Lecture duration must be on the same day.", 400));
        }

        const durationInMs = toDate - fromDate;
        const threeHoursInMs = 3 * 60 * 60 * 1000;

        if (durationInMs <= 0) {

            return next(new httpError("End time must be after start time.", 400));
        }

        if (durationInMs > threeHoursInMs) {

            return next(new httpError("Lecture duration cannot exceed 3 hours.", 400));
        }

        const currentDate = new Date();

        if (fromDate < currentDate.setHours(0, 0, 0, 0)) {

            return next(new httpError("Lecture cannot be scheduled in the past.", 400));
        }

        const isSubject = await subjectModel.findOne({ _id: subject, "is_deleted.status": false })

        if (!isSubject) {

            return next(new httpError("Subject not Found", 404))
        }

        const isTeacher = await teacherModel.findOne({ _id: teacher, "is_deleted.status": false, subject: isSubject })

        if (!isTeacher) {

            return next(new httpError("Teacher not Found", 404))
        }

        const isBatch = await batchModel.findOne({ _id: batch, "is_deleted.status": false })

        if (!isBatch) {

            return next(new httpError("Batch not Found", 404))
        }

        const isStudent = await studentModel.find({ _id: { $in: attendees }, "is_deleted.status": false, batch: isBatch });

        if (isStudent.length !== attendees.length) {

            return next(new httpError("One or more attendees are not found, deleted, or not part of the batch.", 404));
        }

        if (status !== "draft") {

            return next(new httpError(" Required Link ", 404))
        }

        const newLecture = new Lecture({ duration, status, link, subject, teacher, batch, notes, attendees, link, notes })
        await newLecture.save()

        res.status(201).json({
            message: "Lecture Created Successfully",
            data: null,
            status: true,
            access_token: null
        })

    } catch (error) {
        console.log(error);

        return next(new httpError("Oops! Somthing went wrong cannot create Lecture", 500))
    }

}

/** List Lectures */

export const listLecture = async (req, res, next) => {

    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5
        const startIndex = (page - 1) * limit
        const searchQuery = req.query.status || ''

        const searchRegex = new RegExp(searchQuery, 'i')

        const total = await Lecture.countDocuments({
            "is_deleted.status": false, 
            $or: [{ status: { $regex: searchRegex } }]
        })

        const lectures = await Lecture.find({"is_deleted.status": false, $or: [{ status: { $regex: searchRegex } }]})
                .select('-is_deleted')
                .populate([

            {
                path: 'teacher',
                select: 'first_name last_name email subject status profile_img',
                populate: {
                    path: 'subject',
                    select: 'name'
                }
            },

            {
                path: 'subject',
                select: 'name'
            },
            {
                path: 'attendees',
                select: 'first_name last_name email status profile_image student_id'
            },
            {
                path: 'batch',
                select: 'name in_charge',
                populate: {
                    path: 'in_charge',
                    select: 'first_name last_name email subject status profile_img',
                    populate: {
                        path: 'subject',
                        select: 'name'
                    }
                }
            },
        ])
        .skip(startIndex).limit(limit)
        .sort({ createdAt: -1 })

        res.status(200).json({ 
            message: '', 
            data: lectures, 
            status: true, 
            access_token: null,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit), 
        })

    } catch (error) {
        
        return next(new httpError("Oops! Somthing went wrong cannot List Lectures", 500))
    }

}

/** getOne lecture */

export const getOneLecture = async (req, res, next) => {

    try {

        const {id} = req.params

        if (! id) {

            return next(new httpError("lecture ID Required", 400));
        }

        const lecture = await Lecture.findOne({ _id: id })
               .select('-is_deleted')
               .populate([

                {
                    path: 'teacher',
                    select: 'first_name last_name email subject status profile_img',
                    populate: {
                        path: 'subject',
                        select: 'name'
                    }
                },
    
                {
                    path: 'subject',
                    select: 'name'
                },
                {
                    path: 'attendees',
                    select: 'first_name last_name email status profile_image student_id'
                },
                {
                    path: 'batch',
                    select: 'name in_charge',
                    populate: {
                        path: 'in_charge',
                        select: 'first_name last_name email subject status profile_img',
                        populate: {
                            path: 'subject',
                            select: 'name'
                        }
                    }
                },
            ])

        if (! lecture) {

            return next(new httpError("lecture Not Found", 404));
        }

        res.status(200).json({ 
            message: '', 
            data: lecture, 
            status: true, 
            access_token: null
        })

    } catch (error) {
       
        return next(new httpError("Oops! Somthing went wrong cannot get Lecture", 500))
    }

}

/** update lecture */

export const UpdateLecture = async (req, res, next) => {

    try {
        const { id } = req.params;

        if (! id) {

            return next(new httpError("Lecture ID is required", 400));
        }

        const { duration, status, subject, teacher, batch, attendees, link, notes } = req.body;

        const lectureData = {};

        if (duration) {

            if (! duration.from || ! duration.to) {

                return next(new httpError("Both 'from' and 'to' fields are required in duration.", 400));
            }

            const fromDate = new Date(duration.from);
            const toDate = new Date(duration.to);

            if (isNaN(fromDate) || isNaN(toDate)) {

                return next(new httpError("Invalid date format for duration.", 400));
            }

            const isSameDay =
                fromDate.getFullYear() === toDate.getFullYear() &&
                fromDate.getMonth() === toDate.getMonth() &&
                fromDate.getDate() === toDate.getDate();

            if (! isSameDay) {

                return next(new httpError("Lecture duration must be on the same day.", 400));
            }

            const durationInMs = toDate - fromDate;
            const threeHoursInMs = 3 * 60 * 60 * 1000;

            if (durationInMs <= 0) {

                return next(new httpError("End time must be after start time.", 400));
            }

            if (durationInMs > threeHoursInMs) {

                return next(new httpError("Lecture duration cannot exceed 3 hours.", 400));
            }

            const currentDate = new Date();

            if (fromDate < currentDate.setHours(0, 0, 0, 0)) {

                return next(new httpError("Lecture cannot be scheduled in the past.", 400));
            }

            lectureData.duration = duration;
        }

        if (subject) {

            const isSubject = await subjectModel.findOne({ _id: subject, "is_deleted.status": false });

            if (!isSubject) {

                return next(new httpError("Subject not found", 404));
            }

            lectureData.subject = subject;
        }

        if (teacher) {

            const isTeacher = await teacherModel.findOne({ _id: teacher, "is_deleted.status": false, subject });

            if (!isTeacher) {

                return next(new httpError("Teacher not found", 404));
            }

            lectureData.teacher = teacher;
        }

        if (batch) {
            const isBatch = await batchModel.findOne({ _id: batch, "is_deleted.status": false });

            if (!isBatch) {

                return next(new httpError("Batch not found", 404));
            }

            lectureData.batch = batch;
        }

        if (attendees) {

            const isStudent = await studentModel.find({ _id: { $in: attendees }, "is_deleted.status": false, batch });

            if (isStudent.length !== attendees.length) {

                return next(new httpError("One or more attendees are not found, deleted, or not part of the batch.", 404));
            }

            lectureData.attendees = attendees;
        }

        if (status) {

            if (status !== "draft" && link && link.live && !link.recorded) {

                link.recorded = null;
            }

            lectureData.status = status;
        }

        if (link) {

            lectureData.link = link;
        }

        if (notes) {

            lectureData.notes = notes;
        }

        const lecture = await Lecture.findOneAndUpdate(
            { _id: id },
            { $set: lectureData },
            { new: true, runValidators: true }
        );

        if (! lecture) {

            return next(new httpError("Lecture not found", 404));
        }

        res.status(200).json({
            message: "Lecture updated successfully",
            data: null,
            status: true,
            access_token: null,
        });

    } catch (error) {
  
        return next(new httpError("Oops! Something went wrong, cannot update lecture", 500));
    }

};

/** Delete lecture */

export const deleteLecture = async (req, res, next) => {

    try {

        const { id } = req.params
        const user = req.user.id

        if (! id) {

            return next(new httpError("lecture ID required ", 400))
        }

        const lecture = await Lecture.findOneAndUpdate(

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

        if (! lecture) {

            return next(new httpError("Batch not found", 404))

        } else {

            res.status(200).json({
                message: "lecture deleted successfully",
                data: null,
                status: true,
                access_token: null
            })
        }

    } catch (error) {

        return next(new httpError("Failed to delete lecture. Please try again.", 500))
    }

}

