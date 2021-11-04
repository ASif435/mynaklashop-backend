const express = require("express");
const { newOrder, 
    getSingleOrder,
     myOrders, 
     allOrders,
    updateOrder,
    deleteOrder,
     
    } = require("../controlers/ordersControlers");
const router = express.Router();

const {isAuthonticationUser,authorizeRoles} = require("../middlewares/auth");

router.route('/order/new/order').post(isAuthonticationUser, newOrder)
router.route('/order/:id').get(isAuthonticationUser, getSingleOrder)

router.route('/orders/me').get(isAuthonticationUser, myOrders)

router.route('/admin/orders').get(isAuthonticationUser,authorizeRoles('admin'), allOrders)
router.route('/admin/order/:id')
          .put(isAuthonticationUser,authorizeRoles('admin'), updateOrder)
          .delete(isAuthonticationUser,authorizeRoles('admin'), deleteOrder)






module.exports = router;