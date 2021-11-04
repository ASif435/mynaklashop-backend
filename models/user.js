const mongoose =require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please enter your name'],
        maxLength:[30, 'your name cannot excced 30 charcaters'],
    },
    email:{
        type:String,
        required:[true,'Please enter your email'],
        unique:true,
        validate:[validator.isEmail,'please enter valid email']
    },
    password:{
        type:String,
        required:[true,'please enter your password'], 
        minlength:[6,'your password must be longer than 6 charcaters'],
        select:false,

    },
    avatar:{
        public_id:{
            type:String,
        },
        url:{
            type:String,
            required:true, 
        },
    
    },
    role:{
        type:String,
        default:'user',
    },
    createdAt:{
        type:Date,
        default:Date.now,
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date,
    
})

//encripting password before saving password
userSchema.pre('save', async function(next){
  if(!this.isModified('password')){
      next()
  } 

  this.password = await bcrypt.hash(this.password,10)
});

//compare user password
userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password )
}
//get JWT Token
userSchema.methods.getJwtToken = function (){
    return jwt.sign({ id: this._id.toString()},process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRE_TIME
    })
}


//Generate token reset password
userSchema.methods.getResetPasswordToken = function (){
    //generate token
    const resetToken = crypto.randomBytes(20).toString("hex");

    //hash and set reset password token
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest("hex");

    //set token expire time
    this.resetPasswordExpire = Date.now() +30*60**1000

    return resetToken
}

module.exports = mongoose.model("User",userSchema);