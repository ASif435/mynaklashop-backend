const User = require("../models/user");
const errorHandler =require("../utils/errorHandler");
const catchAsyncError = require("../middlewares/catchAsyncError");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const ErrorHandler = require("../utils/errorHandler");

const cloudinary = require("cloudinary");

//register a user => /api/v1/register
//!important notice ami ekhan theke --catchAsyncError eta bad disi
exports.registerUser= catchAsyncError( async (req,res,next)=>{

    const result =  await cloudinary.v2.uploader.upload(req.body.avatar,{
        folder: 'avatars',
        width:150,
        crop:'scale'
    })

    const {name,email,password} = (req.body);
    const user = await User.create({
        name,
        email,
        password,
        avatar:{
            public_id:result.public_id,
            url:result.secure_url
        }
    })
    sendToken(user,200,res)
})


//login user => /api/v1/login
//ami catchAsyncError bad disi
exports.loginUser =  catchAsyncError(async(req,res,next)=>{
    const {email,password} = req.body;
    // check if email and password is entered by user
    if(!email || !password){
        return next( new errorHandler('please enter email & password',400))
    }
    //finding user in database
    const user = await User.findOne({email}).select('+password');

    if(!email){
        return next( new errorHandler('invalid email & password',401))
    }

    //check if password is correct or not
    const isPasswordMatched = await user.comparePassword(password);
    if(!isPasswordMatched){
        return next( new errorHandler('invalid email & password',401))
    }

    sendToken(user,200,res)
})

//forgot password => /api/v1/password/forgot
exports.forgotPassword = async (req,res,next)=>{
    const user = await User.findOne({email:req.body.email});
    if(!user){
        return next( new errorHandler('user not found with this email',404))
    }
    //get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({validateBeforeSave:false})
     //create reset password url
     const resetUrl= `${process.env.FONT_END_URL}/password/reset/${resetToken}`
     
     const message = `your password reset token is as follow:\n\n${resetUrl}\n\n if your not requsted this email,then ignore it`
        try{
            await sendEmail({
                email:user.email,
                subbject:'nakla shop password Recovery',
                message
            })

            res.status(200).json({
                success:true,
                message:`email send to ${user.email}`
            })
        }catch (error){
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
        
            
            await user.save({validateBeforeSave:false})

            return next(new ErrorHandler(error.message,500));

        }
   


}


//reset password => /api/v1/password/reset/:token
exports.resetPassword = async (req,res,next)=>{
    
    //Hash url token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{ $gt:Date.now()}
    })
    if(!user){
        return next(new  errorHandler('password reset token is invalid or has been expired',400))
    }

    if(req.body.password != req.body.confirmPassword){
        return next(new  errorHandler('password does not match',400))
    }

    //setup new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user,200,res)
}

//get currently logged in user details => /api/v1/me
exports.getUserProfile = async (req,res,next)=>{
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success:true,
        user
    })
}
//update / change password => /api/v1/password/update
exports.updatePassword = catchAsyncError (async (req,res,next)=>{
    const user = await User.findById(req.user.id).select('+password');
    
    //check previous user 
    const isMatch =  await user.comparePassword(req.body.oldPassword);
        if(!isMatch){
            return next(new ErrorHandler('Old password is incurrect',400))
        }

        user.password = req.body.password;
        await user.save();

        sendToken(user,200,res)
})

//update user profile => /api/v1/me/update
exports.updateUserProfile = async (req,res,next)=>{

    const newUserData = {
        name:req.body.name,
        email:req.body.email,
    }
    //update avtar 
        if(req.body.avatar != ''){
            const user  = await User.findById(req.user.id);

            const image_id =user.avatar.public_id;
            const res = await cloudinary.v2.uploader.destroy(image_id);
            const result =  await cloudinary.v2.uploader.upload(req.body.avatar,{
                folder: 'avatars',
                width:150,
                crop:'scale'
            })

            newUserData.avatar={
                public_id:result.public_id,
                url:result.secure_url,
            }
        }
    //update Avatar Todo
    const user = await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false,
    })
    res.status(200).json({
        success:true,
    })
}
//logout user => /api/v1/logout
exports.logout = async (req,res,next)=>{
    res.cookie('token',null,{
        expires: new Date(Date.now()),
        httpOnly:true,

    })
    res.status(200).json({
        success:true,
        message: 'log out'
    })
}


// Admin Routes 
//get all user => /api/v1/admin/users
exports.allUsers = async (req,res,next)=>{
    const users = await User.find();

    res.status(200).json({
        success:true,
        users
    })
}

//get user details => /api/admin/user/:id
exports.getUserDetails = async (req,res,next)=>{
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler(`user does not found this is ${req.params.id}`))
    }

    res.status(200).json({
        success:true,
        user
    })
}


//update user profile => /api/v1/admin/user/:id
exports.updateUser = async (req,res,next)=>{

    const newUserData = {
        name:req.body.name,
        email:req.body.email,
        role:req.body.role,
    }

    //update Avatar Todo
    const user = await User.findByIdAndUpdate(req.params.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false,
    })

    res.status(200).json({
        success:true,
    })
}

//Delete user details => /api/admin/user/:id
exports.deleteUser = async (req,res,next)=>{
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler(`user does not found this is ${req.params.id}`))
    }

    //remove Avatar from cludonary -TOdo

    await user.remove();
    res.status(200).json({
        success:true,
        user
    })
}