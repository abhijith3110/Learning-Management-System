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

            a: {
                type: String,
                default: null
            },

            b: {
                type: String,
                default: null
            },

            c: {
                type: String,
                default: null
            },

            d: {
                type: String,
                default: null
            },
   
        },
        
        batch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'batch',
            required: true
        },

        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'admin',
            required: true
        },

        updated_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'admin',
            default: null
        },

        answer: {
            type: [String],
            required: true
        },

        is_deleted: {

            status: { 
                type: Boolean ,
                default:false
            },

            deleted_by: { 
                type: mongoose.Schema.Types.ObjectId ,
                ref: 'admin',
                default: null
            },

            deleted_at: {
                type: Date,
                default: null
            },

        }

    },

    {
        timestamps: true
    }

);

const Question = mongoose.model('question', questionSchema);

export default Question;
