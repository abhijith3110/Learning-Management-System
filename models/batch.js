import mongoose from "mongoose";

const batchSchema = new mongoose.Schema({

        name: {
            type:String,
            required: true
        },

        in_charge: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'teacher',                
            required: true
        },

        type: {
            type:String,
            enum: ['free', 'paid', 'crash course'],
            required: true
        },

        status: {
            type: String,
            enum: ['draft', 'inprogress', 'completed', 'about-to-start'],
            required: true
        },

        duration: {

            from: { 
              type: Date, 
              required: true,  
            },

            to: { 
              type: Date, 
              required: true     
            }

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



const batchModel = mongoose.model('batch', batchSchema)

export default batchModel