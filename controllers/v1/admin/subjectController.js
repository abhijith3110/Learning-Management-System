import subjectModel from "../../../models/subject.js";
import httpError from "../../../utils/httpError.js"

/** Create Subject */

export const createSubject = async ( req, res, next ) => {

    const { subject_name } = req.body;

    if ( !subject_name ) {
        
        return next( new httpError( "Name of the subject is required", 404 ) )
    } 

    try {
        
        const subject = new subjectModel({ subject_name })
        await subject.save()
        res.status(201).json({ message: ` ${subject_name} Subject is Added Successfully`})

    } catch (error) {
        
        return next( new httpError( " Failed to Upload Subject. Please try again", 500 ) )
    }

}


/** list-all Subjects */

export const listSubjects = async ( req, res, next ) => {
    
    try {
        
        const subjects = await subjectModel.find({ "isDeleted.status": false });
        res.status(200).json(subjects)

    } catch (error) {
        
        return next( new httpError("Failed to get Subjects. Please try again", 500) )

    }

}


/** list One Subject */

export const getOneSubject = async (req, res, next) => {

    try {

        const { id } = req.params;

        if (!id) {

            return next(new httpError("Subject ID required", 400));
        }

        const subject = await subjectModel.findOne({ _id: id });

        if (!subject) {

            return next(new httpError("Subject not found", 404));
        }

        res.status(200).json( subject );

    } catch (error) {

        return next(new httpError("Failed to get subject. Please try again", 500));

    }
};


/** Update subject */

export const updateSubject = async ( req, res, next ) => {
    
    try {
        
        const { id } = req.params

        const { subject_name } = req.body

        if (!id ) {

            return next(new httpError("Subject ID required", 400));
        }

        const subject = await subjectModel.findOneAndUpdate( { _id: id} , {$set: {subject_name}}, { new: true, runValidators: true } )

        if ( !subject ) {

            return next(new httpError("Subject not found", 404));
        }

        res.status(200).json({ message: `${subject.subject_name} subject Updated successfully`});

    } catch (error) {
        
        return next(new httpError("Failed to Update subject. Please try again", 500));
    }
}


/** Delete Subject */

export const deleteSubject = async ( req, res, next ) => {

    const { id } = req.params;
    const admin = req.admin.id

    if ( !id ) {

        return next(new httpError("Subject ID required", 400));
    }

    try {
        
        const subject = await subjectModel.findOneAndUpdate( 

            {_id: id, "isDeleted.status": false }, 

            { $set: 
                { 
                    "isDeleted.status": true, 
                    "isDeleted.deleted_by": admin, 
                    "isDeleted.deleted_at": new Date() 
                },

            },

            {new: true} 

        )

        if ( !subject ) {

            return next(new httpError("Subject not found", 404));
        }

        res.status(200).json({ message: `${subject.subject_name} subject deleted successfully`});


    } catch (error) {
        
        return next(new httpError("Failed to delete subject. Please try again", 500));
    }
    
}