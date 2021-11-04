const express = require('express');
const app = express();
const mongoose = require("mongoose");
const bp = require("body-parser");
app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))
let cors = require("cors");
app.use(cors());

const fileUpload = require("express-fileupload");
//import cookie parser
const cookieParser = require("cookie-parser");
app.use(express.json());
app.use(cookieParser());
app.use(fileUpload());

const errorMiddleware = require("./middlewares/error");




//all route

const products = require("./routes/products");
const auth = require("./routes/auth");
const order = require("./routes/order");

app.use("/api/v1",products);
app.use("/api/v1",auth);
app.use("/api/v1",order);


//midddleware to handle error
app.use(errorMiddleware);








module.exports = app;