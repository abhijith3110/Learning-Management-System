import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
    {

        first_name: {
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

        profile_image: {
            type: String,
            default: null
        },

    }, {

        timestamps: true
        
    }
)

const adminModel = mongoose.model( 'admin', adminSchema );

export default adminModel 