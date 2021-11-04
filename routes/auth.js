const express = require("express");
const router = express.Router();
const app = express();
const bp = require("body-parser");
app.use(bp.json());
app.use(bp.urlencoded({ extended: true }))
const {registerUser,
    loginUser, 
    logout,
     resetPassword,
     getUserProfile,
     forgotPassword,
     updatePassword,
     updateUserProfile,
     allUsers,
     getUserDetails,
     updateUser,
     deleteUser
    
    } = require("../controlers/authControler");

    const {isAuthonticationUser,authorizeRoles} = require("../middlewares/auth")

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/logout').get(logout);
router.route('/password/forgot').post(forgotPassword);
router.route('/password/reset/:token').put(resetPassword);

router.route('/me').get(isAuthonticationUser,getUserProfile);
router.route('/password/update').put(isAuthonticationUser,updatePassword);
router.route('/me/update').put(isAuthonticationUser,updateUserProfile);
router.route('/admin/users').get(isAuthonticationUser,authorizeRoles('admin'),allUsers);
router.route('/admin/user/:id')
        .get(isAuthonticationUser,authorizeRoles('admin'),getUserDetails)
        .put(isAuthonticationUser,authorizeRoles('admin'),updateUser)
        .delete(isAuthonticationUser,authorizeRoles('admin'),deleteUser)
module.exports = router