import mongoose from 'mongoose'

const teacherSchema = new mongoose.Schema ({

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
            required: true,
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
            required: true,
        },

        address: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: ['active', 'resigned', 'inactive'],
            required: true
        },
        
        subject: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'subject',
            required:true
        },

        profile_image: {
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

        timestamps: true
    }
)

const teacherModel = mongoose.model( 'teacher', teacherSchema);

export default teacherModel