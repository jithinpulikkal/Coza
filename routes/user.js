var express = require('express');
var router = express.Router();

const nocache = require('nocache');

const userController=require('../controller/userController')
const productController=require('../controller/productController')
const cartController = require('../controller/cartController')
const orderController=require('../controller/orderController')
const wishlistController=require('../controller/wishlistController')
const reviewController=require('../controller/reviewController')
/* GET home page. */

// let verifyLogin = (req, res, next) => {
//   let user = req.session.user
//   if (user) {
//     next()
//   } else {
//     res.redirect('/login')
//   }
// }

let verifyLogin=require('../middlewares/user-auth').userLogin

router.get('/', nocache(),userController.homePage);

router.get('/signup', nocache(),userController.userSignup)
router.post("/signup", userController.userSignupSubmit)

router.get('/login', nocache(),userController.userLogin)
router.post('/login',userController.userLoginPost)
router.get('/logout',nocache(),userController.userLogout)

router.get('/otp-login', nocache(), userController.otpLogin)
router.post('/sent-otp',userController.sendOTP)
router.post('/otp-login',userController.otpLoginPost)

router.get('/profile',verifyLogin,userController.userProfile)
router.post('/update-user-data',userController.updateUserData)
router.get('/wallet',verifyLogin,userController.wallet)

router.get('/Change-password',verifyLogin,userController.changePassword)
router.post('/change-password',userController.changePasswordPost)
router.post('/verify-password',userController.verifyPassword)

router.get('/address-manage',verifyLogin,userController.getUserAddress)
router.get('/add-address/:id',verifyLogin,userController.addAddress)
router.post('/add-address/:id',verifyLogin,userController.addUserAddress)
router.get('/delete-address/:index/:id',verifyLogin,userController.deleteAddress)

router.get('/place-order/select-address/:id',verifyLogin,userController.selectUserAddress)
router.get('/selected-address/:id',verifyLogin,userController.showSelectedAddress)

router.get('/edit-address/:id',verifyLogin,userController.editAddress)
router.post('/edit-address/:id',verifyLogin,userController.updateAddress)

router.get('/forgot-password',userController.forgotPass)
router.post('/forgot-verify',userController.forgotVerify)

router.post('/verifyForgotOTP',userController.verifyForgotOtp)
router.post('/reset-password',userController.resetPassword)

router.get('/about-us',userController.aboutUs)
router.get('/contact',userController.contact)

router.post('/contact',userController.contactPost)
router.get('/invoice/:id',userController.printInvoice)





router.get('/shop',productController.shop)
router.get('/product/:id',productController.singleProduct)
router.post('/select-sort',productController.sortShop)
router.post('/getSearchProduct',productController.productSearch)
router.get('/filter/:selection/:option',productController.filter)
router.get('/disable-filter',productController.disableFilter)
router.get('/pagination/:id',productController.pagination)
router.get('/paginationn/:id',orderController.uPagination)



router.get('/place-order',verifyLogin,nocache(),orderController.placeOrder)
router.post('/place-order',nocache(),orderController.placeOrderPost)
router.post('/verify-payment',orderController.verifyPayment)
router.get('/place-order-success-page',orderController.successOrder)
router.get('/orders',verifyLogin,orderController.viewOrders)
router.get('/order/:id',verifyLogin,orderController.singleOrder)
router.get('/cancel-order/:id([0-9a-fA-F]{24})',verifyLogin,orderController.cancelOrderProducts)
router.post('/cancel-order/:id',verifyLogin,orderController.cancelOrderPost)
router.post('/coupon-apply',verifyLogin,orderController.applyCoupon)
router.get('/remove-coupon',verifyLogin,orderController.removeCoupon)
router.post('/return',orderController.orderReturn)




router.get('/cart',verifyLogin,cartController.cart)
router.post('/add-to-cart/:id', verifyLogin,cartController.addToCart)
router.post('/change-quantity',verifyLogin,cartController.changeProductQuantity)
router.post('/remove-cart-product',verifyLogin,cartController.removeCartProduct)


router.get('/wishlist',verifyLogin,wishlistController.wishList)
router.post('/add-to-wishList/:id',verifyLogin,wishlistController.addToWishlist)
router.get('/remove-from-wishlist/:id',verifyLogin,wishlistController.removeWishlistProduct)


router.get('/add-review/:id',verifyLogin,reviewController.getReview)
router.post('/submit-review/:id',verifyLogin,reviewController.submitReviw)
router.get('/reviews/:id',reviewController.getAllReview)
router.post('/review-filter',reviewController.filter)



module.exports = router;   
