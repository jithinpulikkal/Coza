const productCollection=require('../model/productModel')
const categoryCollection=require('../model/categoryModel')
const cartCollection=require('../model/cartModel')
const mongoose=require('mongoose')
const reviewCollection=require('../model/reviewModel')
const {ObjectId}=mongoose.Types
const uuid=require('uuid')
const sharp=require('sharp')

function CartCount(userId){
    return new Promise(async(resolve) => {
        let cartData=await cartCollection.findOne({user:ObjectId(userId)})
        if(cartData){
            var  count=cartData.products.length
            resolve(count);
        }else{
            var count=0
            resolve(count)
        }
    })
}

module.exports={
    shop: async(req, res,next) => {
        try{
        let user = req.session.user
        let cartCount = 0
        if (user) {
            let userId = user._id
             cartCount = await CartCount(userId)
        }
        let proCount=await productCollection.countDocuments({status:true})
        let limit=8
        let skip=0

        let page=req.session.pagination
        if(page) skip=(page-1)*limit;
        else page=1

       
       
        
        
        
        let sort= req.session.sort
        let filter=req.session.filter
            
        let products=await productCollection.find({status:true}).limit(limit).skip(skip).toArray()
        if(sort && filter){ 
            if(sort=='low' && filter?.selection=='category'){
                let option=filter.option
                products=await productCollection.find({category:option,status:true}).limit(limit).skip(skip).sort({offerPrice:1}).toArray()
                proCount=await productCollection.countDocuments({category:option,status:true})
            }else if(sort=='high' && filter?.selection=='category'){
                let option=filter.option
                products=await productCollection.find({category:option,status:true}).limit(limit).skip(skip).sort({offerPrice:-1}).toArray()
                proCount=await productCollection.countDocuments({category:option,status:true})
            }else if(sort=='low' && filter?.selection=='brand'){
                let option=filter.option
                products=await productCollection.find({brand:option,status:true}).limit(limit).skip(skip).sort({offerPrice:1}).toArray()
                proCount=await productCollection.countDocuments({brand:option,status:true})
            }else if(sort=='high' && filter?.selection=='brand'){
                let option=filter.option
                products=await productCollection.find({brand:option,status:true}).limit(limit).skip(skip).sort({offerPrice:-1}).toArray()
                proCount=await productCollection.countDocuments({brand:option,status:true})
            }else if(sort=='low' && filter?.selection=='price'){
                let option=filter.option
                if(option=='1000'){
                    products=await productCollection.find({offerPrice:{$lt:1000},status:true}).limit(limit).skip(skip).toArray()
                    proCount=await productCollection.countDocuments({offerPrice:{$lt:1000},status:true})
                }else if(option=='1000-2000'){
                    products=await productCollection.find({$and:[{offerPrice:{$gt:1000}},{offerPrice:{$lt:2000}}],status:true}).limit(limit).skip(skip).sort({offerPrice:1}).toArray()
                    proCount=await productCollection.countDocuments({$and:[{offerPrice:{$gt:1000}},{offerPrice:{$lt:2000}}],status:true})
                    
                }else if(option=='2000-3000'){
                    products=await productCollection.find({$and:[{offerPrice:{$gt:2000}},{offerPrice:{$lt:3000}}],status:true}).limit(limit).skip(skip).sort({offerPrice:1}).toArray()
                    proCount=await productCollection.countDocuments({$and:[{offerPrice:{$gt:2000}},{offerPrice:{$lt:3000}}],status:true})
                }else if(option=='3000-4000'){
                    products=await productCollection.find({$and:[{offerPrice:{$gt:3000}},{offerPrice:{$lt:4000}}],status:true}).limit(limit).skip(skip).sort({offerPrice:1}).toArray()
                    proCount=await productCollection.countDocuments({$and:[{offerPrice:{$gt:3000}},{offerPrice:{$lt:4000}}],status:true})
                }else if(option=='4000-5000'){
                    products=await productCollection.find({$and:[{offerPrice:{$gt:4000}},{offerPrice:{$lt:5000}}],status:true}).limit(limit).skip(skip).sort({offerPrice:1}).toArray()
                    proCount=await productCollection.countDocuments({$and:[{offerPrice:{$gt:4000}},{offerPrice:{$lt:5000}}],status:true})
                }else if(option=='5000'){
                    products=await productCollection.find({offerPrice:{$gt:5000},status:true}).sort({offerPrice:1}).limit(limit).skip(skip).toArray()
                    proCount=await productCollection.countDocuments({offerPrice:{$gt:5000},status:true})
                }
            }else if(sort=='high' && filter?.selection=='price'){
                let option=filter.option
                if(option=='1000'){
                    products=await productCollection.find({offerPrice:{$lt:1000},status:true}).limit(limit).skip(skip).toArray()
                    proCount=await productCollection.countDocuments({offerPrice:{$lt:1000},status:true})
                }else if(option=='1000-2000'){
                    products=await productCollection.find({$and:[{offerPrice:{$gt:1000}},{offerPrice:{$lt:2000}}],status:true}).limit(limit).skip(skip).sort({offerPrice:-1}).toArray()
                    proCount=await productCollection.countDocuments({$and:[{offerPrice:{$gt:1000}},{offerPrice:{$lt:2000}}],status:true})
                }else if(option=='2000-3000'){
                    products=await productCollection.find({$and:[{offerPrice:{$gt:2000}},{offerPrice:{$lt:3000}}],status:true}).limit(limit).skip(skip).sort({offerPrice:-1}).toArray()
                    proCount=await productCollection.countDocuments({$and:[{offerPrice:{$gt:2000}},{offerPrice:{$lt:3000}}],status:true})
                }else if(option=='3000-4000'){
                    products=await productCollection.find({$and:[{offerPrice:{$gt:3000}},{offerPrice:{$lt:4000}}],status:true}).limit(limit).skip(skip).sort({offerPrice:-1}).toArray()
                    proCount=await productCollection.countDocuments({$and:[{offerPrice:{$gt:3000}},{offerPrice:{$lt:4000}}],status:true})
                }else if(option=='4000-5000'){
                    products=await productCollection.find({$and:[{offerPrice:{$gt:4000}},{offerPrice:{$lt:5000}}],status:true}).limit(limit).skip(skip).sort({offerPrice:-1}).toArray()
                    proCount=await productCollection.countDocuments({$and:[{offerPrice:{$gt:4000}},{offerPrice:{$lt:5000}}],status:true})
                }else if(option=='5000'){
                    products=await productCollection.find({offerPrice:{$gt:5000},status:true}).limit(limit).skip(skip).sort({offerPrice:-1}).toArray()
                    proCount=await productCollection.countDocuments({offerPrice:{$gt:5000},status:true})
                }
            }

        }
        else if(sort=='low'){
            console.log("/shop",sort);
            products=await productCollection.find({status:true}).limit(limit).skip(skip).sort({offerPrice:1}).toArray()
            

        }else if(sort=='high'){
            products=await productCollection.find({status:true}).limit(limit).skip(skip).sort({offerPrice:-1}).toArray()
        }else if(filter?.selection=='category'){
            let option=filter.option
            products=await productCollection.find({category:option,status:true}).limit(limit).skip(skip).toArray()
            proCount=await productCollection.countDocuments({category:option})
            
        }else if(filter?.selection=='brand'){
            let option=filter.option
            products=await productCollection.find({brand:option,status:true}).limit(limit).skip(skip).toArray()
            proCount=await productCollection.countDocuments({brand:option})
        }else if(filter?.selection=='price'){
            let option=filter.option
            console.log(option);
            if(option=='1000'){
                products=await productCollection.find({offerPrice:{$lt:1000},status:true}).limit(limit).skip(skip).toArray()
                proCount=await productCollection.countDocuments({offerPrice:{$lt:1000}})
            }else if(option=='1000-2000'){
                products=await productCollection.find({$and:[{offerPrice:{$gt:1000}},{offerPrice:{$lt:2000}}],status:true}).limit(limit).skip(skip).toArray()
                proCount=await productCollection.countDocuments({$and:[{offerPrice:{$gt:1000}},{offerPrice:{$lt:2000}}]})
            }else if(option=='2000-3000'){
                products=await productCollection.find({$and:[{offerPrice:{$gt:2000}},{offerPrice:{$lt:3000}}],status:true}).limit(limit).skip(skip).toArray()
                proCount=await productCollection.countDocuments({$and:[{offerPrice:{$gt:2000}},{offerPrice:{$lt:3000}}]})
            }else if(option=='3000-4000'){
                products=await productCollection.find({$and:[{offerPrice:{$gt:3000}},{offerPrice:{$lt:4000}}],status:true}).limit(limit).skip(skip).toArray()
                proCount=await productCollection.countDocuments({$and:[{offerPrice:{$gt:3000}},{offerPrice:{$lt:4000}}]})
            }else if(option=='4000-5000'){
                products=await productCollection.find({$and:[{offerPrice:{$gt:4000}},{offerPrice:{$lt:5000}}],status:true}).limit(limit).skip(skip).toArray()
                proCount=await productCollection.countDocuments({$and:[{offerPrice:{$gt:4000}},{offerPrice:{$lt:5000}}]})
            }else if(option=='5000'){
                products=await productCollection.find({offerPrice:{$gt:5000},status:true}).limit(limit).skip(skip).toArray()
                proCount=await productCollection.countDocuments({offerPrice:{$gt:5000}})
            } 
            
        }
        
        let category=await productCollection.distinct("category",{status:true})
        let brands=await productCollection.distinct("brand")
        let option;
        if(filter){
            option=filter.option
        }

        let c1=Math.ceil(proCount/limit)
        let pageArr=[]
        for(i=0;i<c1;i++){
            pageArr.push(i+1)
        }

        console.log(pageArr);
        
    
        res.render('user/shop', { products, user, category, brands, cartCount ,sort,option ,pageArr,page })
        }
        catch(err){
            next(err)
        }
       
    }, 


    viewProduct: async(req,res,next)=>{
        try{
            let user=req.session.user
        let cartCount
        let proId=req.params.id
        if(user){ 
            cartCount=await CartCount(user._id)
        }
        let review=await reviewCollection.aggregate([
            {
                $match:{product:ObjectId(proId)}
            },
            {
                $unwind:"$review"
            },
            {
                $limit:4
            }
        ]).toArray()
        console.log("reviews",review);
        
        

        let rating=await reviewCollection.aggregate([
            {
                $match:{product:ObjectId(proId)}
            },
            {
                $unwind:'$review'
            },
            {
                $group:{_id:"$product",avg:{$avg:"$review.rating"},count:{$sum:1}}
            }
        ]).toArray()
        let ratingData=rating[0]
        if(ratingData?.avg){
            console.log("rate:",rating[0]);
        
        ratingData.avg=ratingData.avg.toPrecision(2)
        }
        let product= await productCollection.findOne({_id:ObjectId(proId)})
        
        res.render('admin/single-product', { product, user, cartCount,review,ratingData })
        }
        catch(err){
            next(err)
        }
    },

    singleProduct: async(req,res,next)=>{
        try{
            let user=req.session.user
        let cartCount
        let proId=req.params.id
        if(user){ 
            cartCount=await CartCount(user._id)
        }
        let review=await reviewCollection.aggregate([
            {
                $match:{product:ObjectId(proId)}
            },
            {
                $unwind:"$review"
            },
            {
                $limit:4
            }
        ]).toArray()
        console.log("reviews",review);
        
        

        let rating=await reviewCollection.aggregate([
            {
                $match:{product:ObjectId(proId)}
            },
            {
                $unwind:'$review'
            },
            {
                $group:{_id:"$product",avg:{$avg:"$review.rating"},count:{$sum:1}}
            }
        ]).toArray()
        let ratingData=rating[0]
        if(ratingData?.avg){
            console.log("rate:",rating[0]);
        
        ratingData.avg=ratingData.avg.toPrecision(2)
        }
        let product= await productCollection.findOne({_id:ObjectId(proId)})
        
        res.render('user/single-product', { product, user, cartCount,review,ratingData })
        }
        catch(err){
            next(err)
        }
    },

    disableProduct:async(req,res,next)=>{
        try {
            let proId=req.params.id
        
        productCollection.updateOne({_id:ObjectId(proId)},{$set:{status:false}})
            res.redirect('/admin/products')
        } catch (err) {
            next(err)
        }
    },

    enableProduct:async(req,res,next)=>{
        try{
            let proId=req.params.id
            productCollection.updateOne({_id:ObjectId(proId)},{$set:{status:true}})
            res.redirect('/admin/products')
            
        }catch (err) {
            next(err)
        }

    },

    deleteProduct:(req,res)=>{
        let proId=req.params.id
        productCollection.deleteOne({ _id: ObjectId(proId) })
        res.redirect('/admin/products')
    },



 
 
 
    editProduct:async(req,res,next)=>{
        try{
            let admin = req.session.admin
        err = req.session.editProductErr
        let id=req.params.id
        delImgErr = req.session.deleteImgErr
        let product=await productCollection.findOne({_id:ObjectId(id)})
        let cate=await categoryCollection.find().toArray()
        res.render('admin/edit-product',{product,err,cate,delImgErr,admin})
        req.session.editProductErr=null
        }
        catch(err){
            next(err)
        }
    },

    editProductPost:async(req,res,next)=>{
        try{
            let proId = req.params.id
        let productData = req.body
        console.log(productData);
        priceRegx=/^([0-9]){1,6}$/gm
        productRegx=/^([a-zA-Z\s'-]){4,80}$/gm
        brandRegx=/^([A-Za-z ]){3,12}$/gm
        discountRegx=/^([0-9]){1,2}$/gm
        stockRegx=/^([0-9]){1,5}$/gm
        desRegx=/^([A-Za-z0-9 ',_.-]){5,500}$/gm
        let response={}
        if(productData.product==''){
            response.err="Title field is empty"
            rreq.session.editProductErr=response.err
            res.redirect('/admin/edit-product/'+req.params.id)
        }else if(productData.brand==''){
            response.err="Brand filed is empty"
            req.session.editProductErr=response.err
                  res.redirect('/admin/edit-product/'+req.params.id)
        }else if(productData.price==''){
            response.err="Price field is empty"
            req.session.editProductErr=response.err
                  res.redirect('/admin/edit-product/'+req.params.id)
        }else if(productData.stock==''){
            response.err="Stock field is empty"
            req.session.editProductErr=response.err
                  res.redirect('/admin/edit-product/'+req.params.id)
        }else if(productData.category==''){
            response.err="Please choose any category"
            req.session.editProductErr=response.err
                  res.redirect('/admin/edit-product/'+req.params.id)
        }else if(productData.description==''){
            response.err="Description field is empty"
            req.session.editProductErr=response.err
                  res.redirect('/admin/edit-product/'+req.params.id)
        }else if(productRegx.test(productData.product)==false){
            response.err="Invalid Product name,Product name should contain atleast 4 letters"
            req.session.editProductErr=response.err
                  res.redirect('/admin/edit-product/'+req.params.id)
        }else if(brandRegx.test(productData.brand)==false){
            response.err="Invalid Brand name,Brand name should contain atleast 4 letters"
            req.session.editProductErr=response.err
                  res.redirect('/admin/edit-product/'+req.params.id)
        }else if(!productData.S && !productData.M && !productData.L && !productData.XL && !productData.XXL){
            response.err="Choose any Size"
            req.session.editProductErr=response.err
                  res.redirect('/admin/edit-product/'+req.params.id)
        }
        else if(priceRegx.test(productData.price)==false){
            response.err="Price field only allows Numbers"
            req.session.editProductErr=response.err
            res.redirect('/admin/edit-product/'+req.params.id)
        }else if(discountRegx.test(productData.discount)==false){
            response.err="discount field only allows Numbers and range should between 0-99"
            req.session.editProductErr=response.err
            res.redirect('/admin/edit-product/'+req.params.id)
        }else if(stockRegx.test(productData.stock)==false){
            response.err="Stock field only allows Numbers"
            req.session.editProductErr=response.err
            res.redirect('/admin/edit-product/'+req.params.id)
        }else if(desRegx.test(productData.description)==false){
            response.err="Description field should contain atleast 5 words"
            req.session.editProductErr=response.err
                  res.redirect('/admin/edit-product/'+req.params.id)
        }
        else{

            product=await productCollection.findOne({_id:ObjectId(proId)})
            productData.price = parseInt(productData.price)
            productData.discount = parseInt(productData.discount)
            productData.stock = parseInt(productData.stock)
            let size=[]
            if(productData.S=='on')size.push('S'); else size.push('')
            if(productData.M=='on')size.push('M'); else size.push('')
            if(productData.L=='on')size.push('L'); else size.push('')
            if(productData.XL=='on')size.push('XL'); else size.push('')
            if(productData.XXL=='on')size.push('S'); else size.push('')
            let offer = (productData.price * productData.discount) / 100
            let offerPrice = productData.price - offer
            productData.offerPrice = parseInt(offerPrice)
            productData.savings = parseInt(offer)
            productCollection.updateOne({_id:ObjectId(proId)},{$set:{
                product:productData.product,
                brand:productData.brand,
                price:productData.price,
                discount:productData.discount,
                category:productData.category,
                oldCategory:productData.category,
                stock:productData.stock,
                description:productData.description,
                offerPrice:productData.offerPrice,
                savings:productData.savings,
                size:size
            }})
            response.status=true
            response.pro=product
            let Obj=req.files
            console.log(Obj);
            if(Obj){
                count=Object.keys(Obj).length
                console.log(count);
                if(response.status){
                  for(i=0;i<count;i++){
                    imgId=Object.keys(Obj)[i]
                    img=Object.values(Obj)[i]

                    console.log("image : ",img);

                    await sharp(img.tempFilePath)
                    .resize({width:540,height:720})
                    .jpeg({
                        quality:100
                    })
                    .toFile(`public/product-images/${imgId}.jpg`)

                    // img.mv('./public/product-images/'+imgId+'.jpg').then((err)=>{
                    //   if(err){
                    //     console.log(err);
                    //   }
                    // })
                  }
                  res.redirect('/admin/products') 
                }else{
                  req.session.editProductErr=response
                  res.redirect('/admin/edit-product/'+req.params.id)
                }
              }else{
                if(response.status){
                  res.redirect('/admin/products') 
                }else{
                  req.session.editProductErr=response.err
                  res.redirect('/admin/edit-product/'+req.params.id)
                }
              }
           
        }
        
        }
        catch(err){
            next(err)
        }
    },
    
    deleteProductImage:async(req,res,next)=>{
        try{
            let imgId=req.params.imgId
        let response={}
        let product = await productCollection.findOne({ Images: { $in: [imgId] } })

        let count = product.Images.length
        console.log(count);
        if (count <= 2) {
            response.msg = "Can't Delete , Minimum 2 Images required"
            response.id = product._id
            req.session.deleteImgErr = response.msg
            let id = response.id
            res.redirect('/admin/edit-product/' + id)
        } else {
            response.id = product._id
            productCollection.updateMany({}, { $pull: { Images: { $in: [imgId] }, Images: imgId } })
            let id=response.id
            res.redirect('/admin/edit-product/' + id)
        }
        }
        catch(err){
            next(err)
        }
    },

    addProductImage:async(req,res,next)=>{
        try{
            let err = req.session.addProImageErr
        let admin = req.session.admin
        let proId=req.params.id
        let product=await productCollection.findOne({_id:ObjectId(proId)})
        res.render('admin/add-image',{product,err,admin})
        }
        catch(err){
            next(err)
        }
    },

    AddProductImagePost:async(req,res,next)=>{
        try{
            let proId=req.params.id
        let product=await productCollection.findOne({_id:ObjectId(proId)})
            let count=product.Images.length
            let response={}
            if(count>=5){
                response.err="Maximum 5 images are Accepted"
                
                req.session.addProImageErr=response.err
                res.redirect('/admin/add-productImg/'+req.params.id)
            }else{
            let imgId=uuid.v4()
            productCollection.updateOne({_id:ObjectId(proId)},{$push:{Images:imgId}})
            
            await sharp(req.files.Image.tempFilePath)
            .resize({width:540,height:720})
            .jpeg({
                quality:100
            })
            .toFile(`public/product-images/${imgId}.jpg`)
 
            response.status=true
            res.redirect('/admin/products')
            } 
        }
        catch(err){
            next(err)
        }
    },

    adminLogout:(req,res)=>{
        req.session.admin=null
        res.redirect('/admin/login')
    },

    sortShop:(req,res)=>{
        console.log(req.body);
        req.session.sort=req.body.sortOption
        res.json({status:true})
    },

    productSearch:async(req,res,next)=>{
       
        try{
            let payload=req.body.payload.trim();
        console.log(payload);
        let filter=req.session.filter
        let search = await productCollection.find({product: {$regex: new RegExp(''+payload+'.*','i' )}}).toArray()
       
        console.log(filter);
        if(filter?.selection=="category"){
            search = await productCollection.find({product: {$regex: new RegExp(''+payload+'.*','i' )},category:filter.option}).toArray()
        }else if(filter?.selection=="brand"){
            search = await productCollection.find({product: {$regex: new RegExp(''+payload+'.*','i' )},brand:filter.option}).toArray()
        }else if(filter?.selection=="price"){
            let option=filter.option
            console.log(option);
            if(option=='1000'){
                search=await productCollection.find({product: {$regex: new RegExp(''+payload+'.*','i' )},offerPrice:{$lt:1000}}).toArray()
            }else if(option=='1000-2000'){
                search=await productCollection.find({product: {$regex: new RegExp(''+payload+'.*','i' )},$and:[{offerPrice:{$gt:1000}},{offerPrice:{$lt:2000}}]}).toArray()
            }else if(option=='2000-3000'){
                search=await productCollection.find({product: {$regex: new RegExp(''+payload+'.*','i' )},$and:[{offerPrice:{$gt:2000}},{offerPrice:{$lt:3000}}]}).toArray()
            }else if(option=='3000-4000'){
                search=await productCollection.find({product: {$regex: new RegExp(''+payload+'.*','i' )},$and:[{offerPrice:{$gt:3000}},{offerPrice:{$lt:4000}}]}).toArray()
            }else if(option=='4000-5000'){
                search=await productCollection.find({product: {$regex: new RegExp(''+payload+'.*','i' )},$and:[{offerPrice:{$gt:4000}},{offerPrice:{$lt:5000}}]}).toArray()
            }else if(option=='5000'){
                search=await productCollection.find({product: {$regex: new RegExp(''+payload+'.*','i' )},offerPrice:{$gt:5000}}).toArray()
            } 
        }
        search=search.slice(0,10)
        res.send({payload:search})
        }
        catch(err){
            next()
        }
    },

    filter:(req,res)=>{
        let selection=req.params.selection
        let option=req.params.option
        console.log(selection,option)
        let filObj={
            selection:selection,
            option:option
        }
        req.session.filter=filObj
        req.session.pagination=null
        res.redirect('/shop')
    },
    
    disableFilter:(req,res)=>{
        req.session.filter=null
        res.redirect('/shop')
    },
    pagination:(req,res)=>{
        req.session.pagination=req.params.id
        res.redirect('/shop')
    }


}