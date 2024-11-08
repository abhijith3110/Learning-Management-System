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

        }

    }, {

        timestamps:true

    }
)

const batchModel = mongoose.model('batch', batchSchema)

export default batchModel