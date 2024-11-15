import batchModel from "../../../models/batch.js";
import teacherModel from "../../../models/teacher.js";
import httpError from "../../../utils/httpError.js"

/** Create Batch */

export const createBatch = async (req, res, next) => {

    try {

        const { name, in_charge, type, status, duration } = req.body

        if (! name || ! in_charge || ! type || ! status || ! duration) {

            return next(new httpError("All fields are mantatory", 400))
        }

        const existingBatch = await batchModel.findOne({ name })

        if (existingBatch) {

            return next(new httpError("This Batch Already exists", 409));
        }

        const isTeacherExist = await teacherModel.findById({ _id: in_charge });

        if (! isTeacherExist) {

            return next(new httpError("Teacher not Found", 404));
        }

        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        const twoYearsLater = new Date();
        twoYearsLater.setFullYear(currentDate.getFullYear() + 2);
        twoYearsLater.setHours(0, 0, 0, 0);

        const fromDate = new Date(duration.from);
        const toDate = new Date(duration.to);
        
        if (fromDate < currentDate) {

            return next(new httpError("Cannot set a past date to add a course.", 404));
        }

        if (toDate > twoYearsLater) {

            return next(new httpError("The duration cannot exceed 2 years.", 404));
        }

        const newBatch = new batchModel({ name, in_charge, type, status, duration })
        await newBatch.save();

        res.status(201).json({ 
            message: "Batch created Successfully",
            data: null,
            status: true,
            access_token: null
        })

    } catch (error) {

        return next(new httpError("Failed to Create Batch. Please try again.", 500))
    }

}


/** List All Batches */

export const listBatches = async (req, res, next) => {

    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5
        const startIndex = (page - 1) * limit
        const searchQuery = req.query.search  || ''
        const filterStatus = req.query.status  || ''
        const filterType = req.query.type  || ''

        const searchRegex = new RegExp(searchQuery, 'i')

        const filter = {
            "is_deleted.status": false, 
            $or: [{name: {$regex: searchRegex}}],
        }

        if (filterStatus) {
            filter.status = filterStatus;  
        }
        
        if (filterType) {
            filter.type = filterType;  
        }

        const total = await batchModel.countDocuments(filter)

        const batches = await batchModel.find(filter)
            .select('-is_deleted').populate({
                path: 'in_charge',
                select: ' first_name last_name email status profile_image',
                populate: {
                    path: 'subject',
                    select: 'name -_id'
                }
            })
            .skip(startIndex).limit(limit)
            .sort({ createdAt: -1 });

        res.status(200).json({
            data: batches,
            message: '',
            status: true,
            access_token: null,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) 
        })

    } catch (error) {

        return next(new httpError("Failed to List All Batches. Please try again.", 500))
    }

}

/** Get One Batch */

export const getOneBatch = async (req, res, next) => {

    try {

        const { id } = req.params

        if (!id) {

            return next(new httpError("Batch ID required.", 400))
        }


        const batch = await batchModel.findOne({ _id: id })
            .select('-is_deleted')
            .populate({
                path: 'in_charge',
                select: ' first_name last_name email status profile_image',
                populate: {
                    path: 'subject',
                    select: 'name'
                }
            })

        if (! batch) {

            return next(new httpError("Batch Not found.", 404))
        }

        res.status(200).json({
            data: batch,
            message: " ",
            status: true,
            access_token: null
        });

    } catch (error) {

        return next(new httpError("Failed to get Batch. Please try again.", 500))
    }

}


/** Update Batch */

export const updateBatch = async (req, res, next) => {

    try {
        const { id } = req.params

        if (! id) {

            return next(new httpError("Batch ID required", 400))
        }


        const { name, in_charge, type, status, duration } = req.body

        const existingBatch = await batchModel.findOne({ name, _id: { $ne: id } })

        if (req.body.in_charge) {

            const isTeacherExists = await teacherModel.findOne({ _id: in_charge })

            if (! isTeacherExists) {

                return next(new httpError("Teacher Not found", 404))
            }
        }

        if (existingBatch) {

            return next(new httpError("This batch name is already exist", 400))
        }

        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        const twoYearsLater = new Date();
        twoYearsLater.setFullYear(currentDate.getFullYear() + 2);
        twoYearsLater.setHours(0, 0, 0, 0);

        if (duration.from) {

            const fromDate = new Date(duration.from);

            if (fromDate < currentDate) {

                return next(new httpError("Cannot set a past date to add a course.", 404));
            }

        }

        if (duration.to) {

            const toDate = new Date(duration.to);

            if (toDate > twoYearsLater) {

                return next(new httpError("The duration cannot exceed 2 years.", 404));
            }

        }

        const batchData = { name, in_charge, type, status }

        const batch = await batchModel.findOneAndUpdate(
            { _id: id },
            { $set: batchData, "duration.from": duration.from, "duration.to": duration.to },
            { new: true, runValidators: true })

        if (batch) {

            res.status(200).json({
                message: "Batch Updated Successfully ",
                data: null,
                status: true,
                access_token: null
            })

        } else {

            return next(new httpError("batch not found.", 404))
        }

    } catch (error) {

        return next(new httpError("Failed to Update Batch. Please try again.", 500))
    }

}


/** Delete batch */

export const deleteBatch = async (req, res, next) => {

    try {

        const { id } = req.params
        const admin = req.user.id

        if (! id) {

            return next(new httpError("Batch ID required ", 400))
        }

        const batch = await batchModel.findOneAndUpdate(

            { _id: id, "is_deleted.status": false },

            {
                $set:
                {
                    "is_deleted.status": true,
                    "is_deleted.deleted_by": admin,
                    "is_deleted.deleted_at": new Date()
                }
            },

            { new: true }
        )

        if (! batch) {

            return next(new httpError("Batch not found", 404))

        } else {

            res.status(200).json({
                message: "Batch deleted successfully",
                data: null,
                status: true,
                access_token: null
            })
        }

    } catch (error) {

        return next(new httpError("Failed to delete Batch. Please try again.", 500))
    }

}
