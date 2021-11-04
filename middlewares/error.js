const ErrorHandler = require("../utils/errorHandler");

module.exports = (err,req,res,next)=>{
    err.statusCode = err.statusCode ||500;

    if(process.env.NODE_ENV ==="DEVELOPMENT"){
        res.status(err.statusCode).json({
            success:false,
            error:err,
            errMessage:err.message,
            stack:err.stack,

        })
    }

    if(process.env.NODE_ENV === "PRODUCTION"){
        let error = {...err}
        error.message = err.message

        //wrong mongoose object Id error

        if(err.name === 'CastError'){
            const message = `Resolve not found . Invalid ${err.path}`
            error = new ErrorHandler(message,400)
        }

        //mongoose validation error
        if(err.name ==="ValidationError"){
            const message = Object.values(err.errors).map(value=> value.message);
            error = new ErrorHandler(message,400)
        }
        // handling mongoose duplicate key error

        if(err.code ===11000){
            const message = `Duplicate ${Object.keys(err.values)} entered`;
            error = new ErrorHandler(message,400)
        }
        //handling jwt wrong error
        if(err.name ==="JsonWebTokenError"){
            const message = 'json web token is invalid try again !!!';
            error = new ErrorHandler(message,400)
        }
        //handling Expires jwt  error
        if(err.name ==="TokenExpiresError"){
            const message = 'json web token is Expires try again !!!';
            error = new ErrorHandler(message,400)
        }
        res.status(error.statusCode).json({
            success:false,
            message: error.message || "internal server error",
        })
    }

   
}