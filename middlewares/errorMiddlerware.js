export const notFound = (req, res, next) => {
    const error = new Error(`Not found - ${req.originalUrl}`)
    res.status(404)
    next(error)
}

export const errorHandler = (err, req, res, next) => {
   

    const statusCode = err.code ?? 500

    res.status(statusCode).json({
        status: statusCode,
        message: err.message,
    });
  }