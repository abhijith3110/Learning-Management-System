import mongoose from 'mongoose'

const lectureSchema = new mongoose.Schema(
    {

        slot: {

            type: {

                from: { type: Date, required: true },
                to: { type: Date, required: true }

            },

            required: true
        },

        link: {
            type: {

                live: {type: String, default: null},
                recorded: {type: String, default: null}

            },

            default: null
        },

        status: {
            type: String,
            enum: ['draft','pending','progress','completed'],
            required: true
        },

        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'subject',
            required: true
        },

        batch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'batch',
            required: true
        },

        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'teacher',
            required: true
        },

        student: {
            type: [mongoose.Schema.Types.ObjectId],
            ref:'student',
            required: true
        }

    }, {

    timestamps: true

}
)

const lectureModel = mongoose.model('lecture', lectureSchema)

export default lectureModel