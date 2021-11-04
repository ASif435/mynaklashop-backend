const Order = require("../models/orders");
const Product = require("../models/product");
const mongoose = require('mongoose');

const ErrorHandeler = require("../utils/errorHandler");

const catchAsyncError = require("../middlewares/catchAsyncError");

// Create a new order   =>  /api/v1/order/new
exports.newOrder = catchAsyncError(async (req, res, next) => {
    const {
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo

    } = req.body;
    console.log(mongoose.Types.ObjectId.isValid(req.user._id));
    const order = await Order.create({
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
        paidAt: Date.now(),
        user:req.user._id,

    })
    res.status(200).json({
        success: true,
        order
    })
})



//get single order => /api/v1/order/:id
exports.getSingleOrder =  async (req,res,next)=>{
    const order = await Order.findById(req.params.id).populate('user','name email');

    if(!order){
        return next(new ErrorHandeler('no order found with this id',404))
    }

    res.status(200).json({
        success:true,
        order
    })
}
//get logged in user order => /api/v1/orders/me
exports.myOrders = catchAsyncError(async (req, res, next) => {
    const orders = await Order.find({ user: req.user.id })

    res.status(200).json({
        success: true,
        orders
    })
})

//get all orders -ADMIN    => /api/v1/admin/orders
exports.allOrders =  async (req,res,next)=>{
    const orders = await Order.find()

    let totalAmount = 0;

    orders.forEach(order=>{
        totalAmount += order.totalPrice
    })

    res.status(200).json({
        success:true,
        totalAmount,
        orders
    })
}
//update / proccess orders- ADMIN => /api/v1/admin/order/:id
exports.updateOrder =  async (req,res,next)=>{
    const order = await Order.findById(req.params.id)

      if(order.orderStatus === 'Delivered'){
          return next(new ErrorHandeler('you have already Delivered this order',400))
      }

    order.orderItems.forEach(async item=>{
        await updateStock(item.product,item.quantity)
    })

    order.orderStatus = req.body.status,
    order.deliveredAt = Date.now()

    await order.save()

    res.status(200).json({
        success:true
    })
}

async function updateStock(id,params) {
    const product = await Product.findById(id)

    product.stock = product.stock - quantity;

    await product.save({validateDateBeforeSave:false})
}



//Delete order => /api/v1/admin/order/:id
exports.deleteOrder =  async (req,res,next)=>{
    const order = await Order.findById(req.params.id).populate('user','name email');

    if(!order){
        return next(new ErrorHandeler('no order found with this id',404))
    }

     await order.remove()
    res.status(200).json({
        success:true,
    })
}