import mongoose from 'mongoose'

const studentSchema = new mongoose.Schema (
    {

        first_name:{
            type: String,
            required: true
        },

        last_name: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true
        },
        
        password: {
            type: String,
            required: true
        },

        gender: {
            type: String,
            enum: ['male', 'female', 'other'],
            required: true
        },

        dob: {
            type: Date,
            required: true
        },

        age: {
            type: Number,
            required: true
        },

        phone: {
            type: Number,
            required: true
        },

        status: {
            type: String,
            enum: ['active', 'inactive'],
            required: true,
            default: 'active'
        },
        
        student_id: {
            type: String,
            required:true
        },

        batch: {
            type: mongoose.Schema.Types.ObjectId,
            ref:'batch',
            required: true
        },

        profile_image: {
            type: String,
            default: null
        },
        
        address: {
            type: String,
            default: null
        },

        parent_number: {
            type: Number,
            default: null
        },
        
        parent_name: {
            type: String,
            default: null
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


    }, {

        timestamps:true

    }

)

const studentModel = mongoose.model('student',studentSchema)

export default studentModel