import mongoose from 'mongoose'

const subjectSchema = new mongoose.Schema(
    {

        subject_name: {
            type: String,
            required: true
        }

    }, {

        timestamps: true
        
    }
)

const subjectModel = mongoose.model('subject', subjectSchema)

export default subjectModel