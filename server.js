const app = require('./app');


const dotenv = require('dotenv')

const connectDatabase = require("./config/database");
const cloudinary = require("cloudinary");
//setting up config
dotenv.config({path:'backend/config/config.env'})
//handle uncagth exceprtion
process.on('uncaughtException',err=>{
    console.log(`ERROR: ${err.message}`);
    console.log("sutting down due to uncaughtException");
    process.exit(1);
})

//connect database
connectDatabase();

//setting up  cloudinary config
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})
const server = app.listen(process.env.PORT, () => {
    console.log(`server started on port: ${process.env.PORT}`);
 });

 //handle unhandled promise rejection
 process.on('unhandledRejection',err=>{
     console.log(`ERROR: ${err.stack}`);
     console.log("sutting down the server");
     server.close(()=>{
        process.exit(1)
     })
 })