import subjectModel from "../../../models/subject.js";
import httpError from "../../../utils/httpError.js"

/** Create Subject */

export const createSubject = async (req, res, next) => {

    try {

        const { name } = req.body;

        if (! name) {

            return next(new httpError("Name of the subject is required", 404))
        }

        const isSubjectExists = await subjectModel.findOne({ name })

        if (isSubjectExists) {

            return next(new httpError("This subject is Already exists", 400))
        }

        const subjectCreatedBy = req.user.id

        const newsubject = new subjectModel({ name, created_by: subjectCreatedBy })
        await newsubject.save()

        res.status(201).json({ 
            message: ` ${newsubject.name} Subject is Added Successfully`,
            data: null,
            status: true,
            access_token: null
         })

    } catch (error) {
        console.log(error);
        
        return next(new httpError(" Failed to Create Subject. Please try again", 500))
    }

}


/** list-all Subjects */

export const listSubjects = async ( req, res, next ) => {

    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5
        const startIndex = (page - 1) * limit
        const searchQuery = req.query.search  || ''
   
        const searchRegex = new RegExp(searchQuery, 'i')

        const total = await subjectModel.countDocuments({
            "is_deleted.status": false,
            $or: [{ name: { $regex: searchRegex } }]
        })

        const subjects = await subjectModel
            .find({
                "is_deleted.status": false,
                $or: [{ name: { $regex: searchRegex } }]
            })
            .select('-is_deleted')
            .populate('created_by', 'first_name last_name role email status profile_image')
            .populate('updated_by', 'first_name last_name role email status profile_image')
            .skip(startIndex).limit(limit)
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: '',
            status: true,
            data: subjects,
            access_token: null,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) 
        });

    } catch (error) {
        
        next(new httpError("Failed to get subjects. Please try again", 500));
    }

};


/** List All Subject Names */


export const listAllSubjectsNames = async ( req, res, next ) => {

    try {

        const subjects = await subjectModel.find({"is_deleted.status": false,}).select('name').sort({ createdAt: -1 });

        res.status(200).json({
            message: '',
            status: true,
            data: subjects,
            access_token: null,
        });

    } catch (error) {
        console.log(error); 
        next(new httpError("Failed to get subjects. Please try again", 500));
    }

};


/** list One Subject */

export const getOneSubject = async (req, res, next) => {

    try {

        const { id } = req.params;

        if (! id) {

            return next(new httpError("Subject ID required", 400));
        }

        const subject = await subjectModel.findOne({ _id: id })
            .select('-is_deleted')
            .populate('created_by', 'first_name last_name role email status')
            .populate('updated_by', 'first_name last_name role email status');

        if (! subject) {

            return next(new httpError("Subject not found", 404));
        }

        res.status(200).json({  
            message: '', 
            data: subject, 
            status: true, 
            access_token: null
        });

    } catch (error) {

        return next(new httpError("Failed to get subject. Please try again", 500));
    }

};


/** Update subject */

export const updateSubject = async (req, res, next) => {

    try {

        const { id } = req.params
        const { name } = req.body
        const subjectUpdatedBy = req.user?.id

        if (! id) {

            return next(new httpError("Subject ID required", 400));
        }

        if (! name) {

            return next(new httpError("Subject name is required", 400));
        }

        if (! subjectUpdatedBy) {

            return next(new httpError("Unauthorized action", 403));
        }

        const isSubjectExists = await subjectModel.findOne({ name, _id: { $ne: id } })

        if (isSubjectExists) {

            return next(new httpError("This subject is Already exists", 400))
        }

        const subject = await subjectModel.findOneAndUpdate(
            { _id: id }, 
            { $set: { name, updated_by: subjectUpdatedBy } }, 
            { new: true, runValidators: true }
        )

        if (! subject) {
            return next(new httpError("Subject not found", 404));
        }

        res.status(200).json({
             message: `${subject.name} subject Updated successfully`,
             data: null,
             status: true,
             access_token: null 
            });

    } catch (error) {

        return next(new httpError("Failed to Update subject. Please try again", 500));
    }
    
}


/** Delete Subject */

export const deleteSubject = async (req, res, next) => {

    try {

        const { id } = req.params;
        const admin = req.user?.id

        if (! id) {

            return next(new httpError("Subject ID required", 400));
        }

        if (! admin) {

            return next(new httpError("Unauthorized action", 403));
        }

        const subject = await subjectModel.findOneAndUpdate(

            { _id: id, "is_deleted.status": false },

            {
                $set:
                {
                    "is_deleted.status": true,
                    "is_deleted.deleted_by": admin,
                    "is_deleted.deleted_at": new Date()
                },

            },

            { new: true }

        )

        if (! subject) {

            return next(new httpError("Subject not found or already deleted", 404));
        }

        res.status(200).json({ 
            message: `${subject.name} subject deleted successfully`,
            data: null,
            status: true,
            access_token: null
         });

    } catch (error) {

        return next(new httpError("Failed to delete subject. Please try again", 500));
    }

}