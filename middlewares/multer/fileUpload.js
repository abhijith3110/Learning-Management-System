import multer from 'multer'
import path from 'path'

const storage = multer.diskStorage({
    destination: function ( req, file, cb ) {
        cb( null, 'uploads/')
    },

    filename: function (req, file, cb) {
        cb( null, file.fieldname + '-' + Date.now() + path.extname(file.originalname) )
    }
})

export const uploadImage = multer({
    storage: storage,

    limits: {
        fieldSize: 1024*1024*10
    },
    
})

