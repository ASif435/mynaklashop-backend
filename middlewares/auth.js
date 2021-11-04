const User = require("../models/user");
const jwt  = require("jsonwebtoken");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("./catchAsyncError");

//checks  if user is authoncation or not
exports.isAuthonticationUser = catchAsyncError( async (req,res,next)=>{
    
    const token = req.cookies.token;
    // console.log("this is token",req.cookies)
    if(!token){
        return next(new ErrorHandler('login first to access this resource.',401))
    }
    
    const verifyUser = jwt.verify(token,process.env.JWT_SECRET)
    req.user = await User.findById(verifyUser.id); 
    // console.log(verifyUser)


    next()
})



//athorize roles

exports.authorizeRoles = (...roles)=>{
    return (req,res,next)=>{
        console.log(req.user.role)
        if(!roles.includes(req.user.role)){
            return next(
            new ErrorHandler(`Role (${req.user.role}) is not allowed to access thsi resource`,403))
        }
        next()
    }
}