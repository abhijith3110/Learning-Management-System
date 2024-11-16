import Question from "../../../models/question.js"
import httpError from "../../../utils/httpError.js"
import batchModel from "../../../models/batch.js";

/** Create Question */

export const createQuestion = async (req, res, next) => {

    try {

        const { question, answer, type, options, batch } = req.body;

        if (! question || ! answer || ! type || ! batch) {

            return next(new httpError("All fields are mandatory", 400));
        }

        if (type === "objective") {

            if (! options || ! options.a || ! options.b) {

                return next(new httpError("At least two options (a and b) are required for Objective type Question", 400));
            }

        } else if (type === "subjective" && options) {

            return next(new httpError("Options are not required for Subjective type Question", 400));
        }

        const isBatchExists = await batchModel.findOne({ _id: batch, "is_deleted.status": false });
 
        if (! isBatchExists) {

            return next(new httpError("Batch not Found or Batch is deleted ", 404));
        }

        const questionCreatedBy = req.user.id;

        const newQuestion = new Question({
            question,
            options: type === "objective" ? options : undefined, 
            answer,
            type,
            batch,
            created_by: questionCreatedBy,
        });

        await newQuestion.save();

        res.status(201).json({
            message: "Question created successfully",
            data: null,
            status: true,
            access_token: null,
        });

    } catch (error) {
      console.log(error);
      
        return next(new httpError("Failed to create Question, Please Try again", 500));
    }

};


export const listQuestions = async (req, res, next) => {

    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5
        const startIndex = (page - 1) * limit
        const searchQuery = req.query.type  || ''

        const searchRegex = new RegExp(searchQuery, 'i')

        const filter = {
            "is_deleted.status": false, 
            $or: [{type: {$regex: searchRegex}}],
        }

        const total = await Question.countDocuments(filter)

        const question = await Question.find(filter)
            .select('-is_deleted')
            .populate([
                {
                    path: 'batch',
                    select: '-is_deleted',
                    populate: {
                        path: 'in_charge',
                        select: 'first_name last_name email status subject profile_image',
                        populate: {
                            path: 'subject',
                            select: 'name'
                        }
                    }
                },

                {
                    path: 'created_by',
                    select: 'first_name last_name email  role subject',
                },

                {
                    path: 'updated_by',
                    select: 'first_name last_name email  role subject',
                },
            ])
        skip(startIndex).limit(limit)
            .sort({ createdAt: -1 });

        res.status(200).json({
            data: question,
            message: '',
            status: true,
            access_token: null,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) 
        })

    } catch (error) {

        return next(new httpError("Failed to List Questions, Please Try again", 500));
    }
}


/** getOne Question */

export const getOneQuestion = async (req, res, next) => {

    try {
        
        const { id } = req.params

        if (! id) {

            return next(new httpError("Question ID required.", 400))
        }    

        const question = await Question.findOne({ _id: id })
            .select('-is_deleted')
            .populate([
                {
                    path: 'batch',
                    select: '-is_deleted',
                    populate: {
                        path: 'in_charge',
                        select: 'first_name last_name email status subject profile_image',
                        populate: {
                            path: 'subject',
                            select: 'name'
                        }
                    }
                },
                {
                    path: 'created_by',
                    select: 'first_name last_name email  role subject',
                },
                {
                    path: 'updated_by',
                    select: 'first_name last_name email  role subject',
                },
            ])

        if (! question) {

            return next(new httpError("question Not found.", 404))
        }

        res.status(200).json({
            data: question,
            message: " ",
            status: true,
            access_token: null
        });

    } catch (error) {
        console.log(error);
        
        return next(new httpError("Failed to get Question, Please Try again", 500));
    }
}

export const updateQuestion = async (req, res, next) => {

    try {

        const { id } = req.params; 
        
        if (! id) {

            return next(new httpError("question ID required", 400))
        }

        const { question, answer, type, options, batch } = req.body;

        if (type === "objective") {

            if (!options || !options.a || !options.b) {

                return next(new httpError("At least two options (a and b) are required for Objective type Question", 400));
            }

        } else if (type === "subjective" && options) {

            return next(new httpError("Options are not required for Subjective type Question", 400));
        }

        const isBatchExists = await batchModel.findOne({ _id: batch, "is_deleted.status": false });

        if (!isBatchExists) {

            return next(new httpError("Batch not found or Batch is deleted", 404));
        }

        const updatedFields = {
            question,
            options: type === "objective" ? options : undefined,
            answer,
            type,
            batch,
            updated_by: req.user.id, 
        };

        const updatedQuestion = await Question.findOneAndUpdate(
            { _id: id }, 
            { $set: updatedFields }, 
            { new: true } 
        );

        if (! updatedQuestion) {

            return next(new httpError("question not found", 400));
        }

        res.status(200).json({
            message: "Question updated successfully",
            data: null,
            status: true,
            access_token: null,
        });

    } catch (error) {

        return next(new httpError("Failed to update Question, Please try again", 500));
    }
};


/** Delete Question */

export const deleteQuestion = async (req, res, next) => {

    try {

        const { id } = req.params
        const user = req.user.id

        if (! id) {

            return next(new httpError("Batch ID required ", 400))
        }

        const question = await Question.findOneAndUpdate(

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

        if (! question) {

            return next(new httpError("Question not found", 404))

        } else {

            res.status(200).json({
                message: "Question deleted successfully",
                data: null,
                status: true,
                access_token: null
            })
        }

    } catch (error) {

        return next(new httpError("Failed to delete Question. Please try again.", 500))
    }

}
