var express = require('express');
const nocache = require('nocache');
var router = express.Router();
const { response } = require('express');

const adminController=require('../controller/adminController')
const productController=require('../controller/productController');
const couponController=require('../controller/couponController');
const categoryController=require('../controller/categoryController');
const orderController = require('../controller/orderController');
const { adminAddProduct } = require('../controller/adminController');



/* GET users listing. */
// let verifyLogin=(req,res,next)=>{
//   let admin=req.session.admin
//   if(admin){
//     next()
//   }else{
//     res.redirect('/admin/login')
//   }
// }

let verifyLogin=require('../middlewares/admin-auth').adminLog

router.get('/',nocache(),verifyLogin,adminController.adminHome)

router.get('/login',nocache(), adminController.adminLogin)
router.post('/login',nocache(),adminController.adminLoginPost)

router.get('/products',verifyLogin,adminController.adminProduct)
router.get('/add-product',verifyLogin,adminController.adminAddProduct)
router.post('/add-product',verifyLogin,adminController.adminAddProductPost)

router.get('/user-list',verifyLogin,adminController.adminUserList)
router.get('/ban-user/:id',verifyLogin,adminController.banUser)
router.get('/unblock-user/:id',verifyLogin,adminController.unblockUser)
router.get('/delete-user/:id',verifyLogin,adminController.deleteUser)

router.get('/sales-report',verifyLogin,adminController.salesReport)
router.post('/sales-report',verifyLogin,adminController.salesReportPost)

router.get('/banner-image',verifyLogin,adminController.bannerImage)
router.post('/update-banner',verifyLogin,adminController.bannerUpdate)

router.post('/order-filter',verifyLogin,adminController.orderFilter)

router.post('/user-filter',verifyLogin,adminController.userFilter)

router.get('/getChart-data',verifyLogin,adminController.chartData)
router.get('/getChart-dataWeek',verifyLogin,adminController.chartDataWeek)

router.get('/submit-return-request/:response/:id',verifyLogin,adminController.returnAccept)

router.post('/sales-report-range',verifyLogin,adminController.salesReportRange)

router.get('/pagination/:id',adminController.pagination)
router.get('/paginationn/:id',orderController.aPagination)


router.get('/logout',productController.adminLogout)
router.post('/getSearchProduct',productController.productSearch)

router.get('/edit-product/:id',verifyLogin,productController.editProduct)
router.post('/edit-product/:id',verifyLogin,productController.editProductPost)
router.get('/delete-product/:id',verifyLogin,productController.deleteProduct)
router.get('/enable-product/:id',verifyLogin,productController.enableProduct)
router.get('/disable-product/:id',verifyLogin,productController.disableProduct)

router.get('/delete-image/:imgId',verifyLogin,productController.deleteProductImage)
router.get('/add-productImg/:id',verifyLogin,productController.addProductImage)
router.post('/add-productImg/:id',verifyLogin,productController.AddProductImagePost)

router.get('/view-product/:id',verifyLogin,productController.viewProduct)

router.get('/categories',verifyLogin,categoryController.getCategory)
router.post('/categories',verifyLogin,categoryController.postCategory)
router.post('/add-category',verifyLogin,categoryController.addCategory)
router.get('/disable-category/:id',verifyLogin,categoryController.disableCategory)
router.get('/enable-category/:id',verifyLogin,categoryController.enableCategory)
router.get('/delete-category/:id',verifyLogin,categoryController.deleteCategory)
router.get('/edit-category/:id',verifyLogin,categoryController.editCategory)
router.post('/edit-category/:id',verifyLogin,categoryController.updateCategory)

router.get('/category-disable/:id',verifyLogin,categoryController.categoryDisable)
router.post('/category-disable/:id',verifyLogin,categoryController.categoryUpdate)




router.get('/all-orders',verifyLogin,orderController.adminAllOrder)
router.get('/orderdetails/:id([0-9a-fA-F]{24})',verifyLogin,orderController.orderDetails)
router.post('/update-order-status/:id',verifyLogin,orderController.changeOrderStatus)
router.get('/submit-order-request/:set/:id',verifyLogin,orderController.orderCancelRequest)



router.get('/coupons',verifyLogin,couponController.couponsGet)
router.get('/add-coupon',verifyLogin,couponController.addCoupon)
router.post('/add-coupon',verifyLogin,couponController.addCouponPost)
router.get('/edit-coupon/:id',verifyLogin,couponController.editCoupon)
router.post('/edit-coupon/:id',verifyLogin,couponController.couponUpdate)
router.get('/delete-coupon/:id',verifyLogin,couponController.deleteCoupon)



module.exports = router;
  