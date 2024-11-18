import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(

    {
        participants: {

            status: {
                type: String,
                enum: ['pending', 'completed'],
                default: null
            },

            attachments: {
                type: [String],
                default: null
            },

            student: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'student',
                default: null
            }

        },

        status: {
            type: String,
            enum: ['active','inactive'],
            required: true
        },

        lecture: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'lecture',
            required: true  
        },

        last_date: {
            type: Date,
            required:true
        },

        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'auth_model',
            required: true  
        },

        updated_by: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'admin',
            default: null
        },

        questions: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'question',
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

const Assignment = mongoose.model('assignment', assignmentSchema);

export default Assignment;
