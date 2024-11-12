import mongoose from 'mongoose'

const teacherSchema = new mongoose.Schema (
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
            required: true,
            validate: {
                validator: function(val) {
                    return /^(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{6,}$/.test(val);
                },
                message: "Password must be at least 6 characters long and include at least one special character"
            }
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
            validate: {
                validator: function(val) {
                    return /^\d{10}$/.test(val.toString());
                },
                message: "Phone number must be exactly 10 digits."
            }
        },

        status: {
            type: String,
            enum: ['active', 'resigned'],
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

        isDeleted: {

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