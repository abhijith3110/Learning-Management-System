import batchModel from "../../../models/batch.js";
import teacherModel from "../../../models/teacher.js";
import httpError from "../../../utils/httpError.js"

/** Create Batch */

export const createBatch = async (req, res, next) => {

    try {

        const { batch_name, teacher_incharge } = req.body

        if (!batch_name || !teacher_incharge) {

            return next(new httpError("All fields are mantatory", 404))
        }

        try {

            const existingBatch = await batchModel.findOne({ batch_name })

            if (existingBatch) {

                return next(new httpError("This Batch Already exists", 409));
            }

            const teacherIsExist = await teacherModel.findById(teacher_incharge);

            if (!teacherIsExist) {

                return next(new httpError("Teacher not Found", 404));
            }


            const newBatch = new batchModel({ batch_name, teacher_incharge })
            await newBatch.save();
            res.status(201).json({ message: "Batch created Successfully" })

        } catch (error) {

            return next(new httpError("Error saving Batch data", 500));

        }

    } catch (error) {

        return next(new httpError("Failed to Create Batch. Please try again.", 500))
    }

}


/** List All Batches */

export const listBatches = async (req, res, next) => {

    try {

        const batches = await batchModel.find().populate('teacher_incharge')
        res.status(200).json(batches)

    } catch (error) {

        return next(new httpError("Failed to List All Batches. Please try again.", 500))

    }

}

/** Get One Batch */

export const getOneBatch = async (req, res, next) => {

    const { id } = req.params

    if (!id) {

        return next(new httpError("Batch ID required.", 400))
    }

    try {

        const batch = await batchModel.findOne({ _id: id }).populate('teacher_incharge')

        if (!batch) {

            return next(new httpError("Batch Not found.", 404))
        }

        res.status(200).json(batch);

    } catch (error) {

        return next(new httpError("Failed to get Batch. Please try again.", 500))
    }


}


/** Update Batch */

export const updateBatch = async (req, res, next) => {

    const { id } = req.params

    if (!id) {

        return next(new httpError("Batch ID required", 400))
    }

    try {

        const { batch_name, teacher_incharge } = req.body

        const existingBatch = await batchModel.findOne({ batch_name, _id: { $ne: id }})

        if ( req.body.teacher_incharge) {

            const isTeacherExists = await teacherModel.findOne({ _id: teacher_incharge })

            if (!isTeacherExists) {

                return next(new httpError("Teacher Not found", 404))
            }
        }

        if (existingBatch) {

            return next(new httpError("This batch name is already exist", 400))
        }
    

        const batchData = { batch_name, teacher_incharge }

        const batch = await batchModel.findOneAndUpdate({ _id: id }, { $set: batchData }, { new: true, runValidators: true })

        if (batch) {

            res.status(200).json({ message: "Batch Updated Successfully " })
        } else {

            return next(new httpError("batch not found.", 404))
        }

    } catch (error) {

        return next(new httpError("Failed to Update Batch. Please try again.", 500))
    }

}


/** Delete batch */

export const deleteBatch = async ( req, res, next ) => {

    const { id } = req.params

    if (!id) {

        return next(new httpError("Batch ID required ", 400))
    }

    try {
        
        const batch = await batchModel.findOneAndDelete({ _id: id })

        if (!batch) {

            return next(new httpError("Batch not found", 404))

        } else {

            res.status(200).json({ message: "Batch deleted successfully"})
        }

    } catch (error) {
        
        return next(new httpError("Failed to delete Batch. Please try again.", 500))
    }
    
}
