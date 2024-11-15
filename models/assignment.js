import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(

    {
        participants: {

            status: {
                type: String,
                enum: ['pending', 'completed'],
                required: true
            },

            attachments: {
                type: [String],
                required: true
            },

            student: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'student',
                required: true
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
            refPath: 'auth_model',
            required: true  
        },

        auth_model: {
            type: String,
            enum: ['teacher', 'admin'],
            required: true,
        },

        questions: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'question',
            required: true  
        },

    },

    {
        timestamps: true
    }

);

const Assignment = mongoose.model('assignment', assignmentSchema);

export default Assignment;
