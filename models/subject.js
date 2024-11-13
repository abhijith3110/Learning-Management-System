import mongoose from 'mongoose'

const subjectSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    },

    updated_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        default: null
    },

    is_deleted: {

        status: {
            type: Boolean,
            default: false
        },

        deleted_by: {
            type: mongoose.Schema.Types.ObjectId,
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

})

const subjectModel = mongoose.model('subject', subjectSchema)

export default subjectModel