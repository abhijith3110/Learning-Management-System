import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({

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
            required: true
        },

        gender: {
            type: String,
            enum: ['male', 'female', 'other'],
            required: true
        },

        phone: {
            type: Number,
            required: true
        }, 

        role: {
            type:String,
            enum: ['superadmin', 'admin'],
            required: true
        },

        status: {
            type: String,
            enum: ['active', 'inactive'],
            default:'active',
            required: true
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

const adminModel = mongoose.model( 'admin', adminSchema );

export default adminModel 