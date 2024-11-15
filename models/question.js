import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(

    {

        type: {
            type: String,
            enum: ['objective', 'subjective'],
            required: true
        },

        question: {
            type: String,
            required: true
        },

        options: {

            A: {
                type: String,
                requied: true,
            },

            B: {
                type: String,
                requied: true,
            },

            C: {
                type: String,
                default: null
            },

            D: {
                type: String,
                default: null
            },

        },

        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'auth_model',
            required: true
        },

        updated_by: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'auth_model',
            required: true
        },

        auth_model: {
            type: String,
            enum: ['teacher', 'admin'],
            required: true,
        },

        answer: {
            type: [String],
            required: true
        },

    },

    {
        timestamps: true
    }

);

const Question = mongoose.model('question', questionSchema);

export default Question;
