const Product = require("../models/product");

const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middlewares/catchAsyncError");
const ApiFeatures = require("../utils/apiFuature");
const cloudinary = require("cloudinary");
//create product /api/v1/product/new
exports.newProduct = catchAsyncError (async (req,res,next)=>{

    let images = []
    if(typeof req.body.images === 'string'){
        images.push(req.body.images)
    }else{
        images = req.body.images
    }

    let imagesLinks = [];
    for(let i=0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i],{
            folder:'products'
        });
        imagesLinks.push({
            public_id:result.public_id,
            url:result.secure_url,
        })
    }

    req.body.images = imagesLinks;
    req.body.user = req.user.id;

    const product =  await Product.create(req.body);
    
    res.status(201).json({
        success:true,
        product
    })

})
// get  product by keyword => /api/v1/products/

exports.getProducts = catchAsyncError (async (req,res,next)=>{
    const resPerPage = 4;
    const productCount = await Product.countDocuments();
    const apiFeature =  new ApiFeatures(Product.find(),req.query)
                        .search()
                        .pagination(resPerPage)
                        .filter()
    const products = await apiFeature.query;
        
    res.status(200).json({
        success:true,
        productCount,
        resPerPage,
        products
    });
})
exports.getKey = catchAsyncError (async (req,res,next)=>{
    const productCount = await Product.countDocuments();
    const apiFeature =  new ApiFeatures(Product.find(),req.query)
                        .search()
    const products = await apiFeature.query;
        
    res.status(200).json({
        success:true,
        productCount,
        products
    });
})

// get all product by (admin) => /api/v1/admin/products/

exports.getAdminProducts = catchAsyncError (async (req,res,next)=>{
    const products = await Product.find();
    
    res.status(200).json({
        success:true,
        products
    });
})

// get single product => /api/v1/product/:id 

exports.getSignleProduct = (async (req,res,next)=>{
    const product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHandler('product not found',404));
    }
    res.status(200).json({
        success:true,
        product
    });
});

//update product => /api/v1/admin/product/:id
exports.updateProduct = catchAsyncError(async (req,res,next)=>{
    let product = await Product.findById(req.params.id);
    
    if(!product){
        return next(new ErrorHandler('product not found',404));
    }


    let images = []
    if(typeof req.body.images === 'string'){
        images.push(req.body.images)
    }else{
        images = req.body.images
    }

    if(images !== undefined){

         //deleting images associated with the product
        for(let i=0; i < product.images.length; i++){
        const result = await cloudinary.v2.uploader.destroy(product.images[i].public_id)
         }

          let imagesLinks = [];
    for(let i=0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i],{
            folder:'products'
        });
        imagesLinks.push({
            public_id:result.public_id,
            url:result.secure_url,
        })
    }

    req.body.images = imagesLinks;
    }

   

    product = await Product.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false,

    });
    res.status(200).json({
        success:true,
        product
    });
})
//delate product => /api/v1/admin/product/:id
exports.deleteProduct =catchAsyncError (async (req,res,next)=>{
    let product = await Product.findById(req.params.id);
    if(!product){
        return next(new ErrorHandler('product not found',404));
    }

    //deleting images associated with the product
    for(let i=0; i < product.images.length; i++){
        const result = await cloudinary.v2.uploader.destroy(product.images[i].public_id)
    }


   await  product.remove();
    res.status(200).json({
        success:true,
        message:"product is deleted..."
    });
})


//create new review => /api/v1/review
exports.createProductReview = catchAsyncError( async (req,res,next)=>{

    const { rating, comment, productId } = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }
    console.log(review)
    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find(
        r => r.user.toString() === req.user._id.toString()
    )
        console.log(isReviewed)
    if (isReviewed) {
        product.reviews.forEach(review => {
            if (review.user.toString() === req.user._id.toString()) {
                review.comment = comment;
                review.rating = rating;
            }
        })

    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length
    }

    product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true
    })

})

//Get product review => /api/v1/reviews

exports.getProductReviews =  catchAsyncError( async (req,res,next)=>{
    const product =  await Product.findById(req.query.id);

    res.status(200).json({
        success:true,
        reviews: product.reviews
    })
})

//Delete product review => /api/v1/reviews

exports.deleteReviews =  catchAsyncError( async (req,res,next)=>{
    const product =  await Product.findById(req.query.productId);

    const reviews = product.reviews.filter(review=> review._id.toString() != req.query.id.toString());

    const numOfReviews = reviews.length;
  const ratings =   product.review.reduce((acc,item)=>item.rating +acc,0) /reviews.length;

    await Product.findByIdAndUpdate(req.query.productId,{
        reviews,
        ratings,
        numOfReviews
    },{
        new:true,
        runValidators:true,
        useFindAndModify:false,
    })
    res.status(200).json({
        success:true,
    })
})
