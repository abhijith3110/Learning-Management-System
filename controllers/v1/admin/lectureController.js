import lectureModel from "../../../models/lecture.js";
import httpError from "../../../utils/httpError.js"
import subjectModel from "../../../models/subject.js"
import teacherModel from "../../../models/teacher.js"
import batchModel from "../../../models/batch.js"

/** Create Lecture */

export const createLecture = async ( req, res, next ) => {

    try {
        
        const { slot, status, subject, teacher, batch } = req.body

        if ( !slot || !status || subject || !teacher || !batch ) {

            return next( new httpError ("All fields are Mandatory",400))
        }

        if (!slot.from || !slot.to) {

            return next( new httpError ("Slot with from and to times is required.",400))
        }

        const isSubject = await subjectModel.find({ subject })
        const isTeacher = await teacherModel.find({ teacher })
        const isBatch = await batchModel.find({ batch })

        if ( !isSubject || !isTeacher || !isBatch ) {

            return next( new httpError ("Data not Found",404))
        }

        if ( status !== "draft" ) {

            return next( new httpError (" Required Link ",404))
        }

        const newLecture = new lectureModel({ slot, status, link, subject, teacher, batch})
        await newLecture.save()
        res.staus(201).json({ message: "Lecture Created Successfully" })
        
    } catch (error) {
        
        return next( new httpError ("Oops! Somthing went wrong cannot create Lecture",500))
    }
    
}

/** List Lectures */

