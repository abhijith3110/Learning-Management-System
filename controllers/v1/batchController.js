import batchModel from "../../models/batch.js";
import teacherModel from "../../models/teacher.js";
import httpError from "../../utils/httpError.js"

/** Create Batch */

export const createBatch = async ( req, res, next ) => {

    try {

        const { batch_name, teacher_incharge } = req.body

        if ( !batch_name || !teacher_incharge ) {

            return next(new httpError("All fields are mantatory", 404))
        }

        try {

            const existingBatch = await batchModel.findOne({ batch_name })

            if (existingBatch) {

                return next(new httpError("This Batch Already exists", 409));
            }

            const teacherIsExist = await teacherModel.findById(teacher_incharge);

            if ( !teacherIsExist ){

                return next(new httpError("Teacher not Found", 404));
            }

            
            const newBatch = new batchModel( { batch_name, teacher_incharge } )
            await newBatch.save();
            res.status(201).json({message: "Batch created Successfully"})

        } catch (error) {
            
            return next(new httpError("Error saving Batch data", 500));

        }
        
    } catch (error) {
        
        return next( new httpError("Failed to Create Batch. Please try again."),500)
    }

}


/** List All Batches */

export const listBatches = async ( req, res, next ) => {

    try {

        const batches = await batchModel.find().populate('teacher_incharge')
        res.status(200).json(batches)
        
    } catch (error) {
        
        return next( new httpError("Failed to List All Batches. Please try again."),500)

    }

}

/** Get One Batch */

// export const getOneBatch = async ( req, res, next ) => {

//     try {

//     } catch (error) {
        
//         return next( new httpError("Failed to get Batch. Please try again."),500)

//     }

// }

