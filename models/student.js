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
            enum: ['active', 'resigned'],
            required: true
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


    }, {

        timestamps:true

    }

)

const studentModel = mongoose.model('student',studentSchema)

export default studentModel