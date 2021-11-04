const Product= require("../models/product");
const dotenv = require("dotenv");
const connectDatabase = require("../config/database");
const product = require("../data/product");

//setting dotenv file
dotenv.config({path:'backend/config/config.env'});

connectDatabase();

const seedProducts = async()=>{
    try{

       await Product.deleteMany();
       console.log("product are deleted");
        await  Product.insertMany(product);
         console.log('all product are added');

      process.exit();


    }catch(err){
        console.log(err.message)
        process.exit();
    }
}

seedProducts();