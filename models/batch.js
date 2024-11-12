import mongoose from "mongoose";

const batchSchema = new mongoose.Schema(
    {

        batch_name: {

            type:String,
            required: true

        },

        teacher_incharge: {

            type: mongoose.Schema.Types.ObjectId, 
            ref: 'teacher',                
            required: true

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

        timestamps:true

    }
)

const batchModel = mongoose.model('batch', batchSchema)

export default batchModel