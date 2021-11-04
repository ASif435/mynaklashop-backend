const express = require("express");
const router = express.Router({ mergeParams: true });

const {getProducts,
    newProduct,
    getSignleProduct,
    updateProduct,
    deleteProduct,
    createProductReview,
    getProductReviews,
    deleteReviews,
    getAdminProducts,
    getKey
} = require("../controlers/productControler");

const {isAuthonticationUser,authorizeRoles} = require("../middlewares/auth");


router.route("/products").get(getProducts);
router.route("/product/key").get(getKey);

router.route("/admin/products").get(getAdminProducts);

router.route("/product/:id").get(getSignleProduct);
router.route("/admin/product/:id")
        .put(isAuthonticationUser,updateProduct)
        .delete(isAuthonticationUser,deleteProduct);

router.route("/admin/product/new").post(isAuthonticationUser,newProduct);  


router.route("/review").put(isAuthonticationUser,createProductReview)
router.route("/reviews").get(isAuthonticationUser,getProductReviews)
router.route("/reviews").delete(isAuthonticationUser,deleteReviews)







module.exports = router;