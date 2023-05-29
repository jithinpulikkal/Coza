const productCollection = require('../model/productModel')
const categoryCollection = require('../model/categoryModel')
const mongoose = require('mongoose')
const product = require('../model/productModel')
const { ObjectId } = mongoose.Types


module.exports={
    getCategory:async(req,res,next)=>{
        try{
            let data = req.session.cateData
        // let err = req.session.categoryErr
        let category = req.session.editCateData
        let admin = req.session.admin
        // console.log(err);
        let categories= await categoryCollection.find().toArray()
        res.render('admin/categories',{categories,data,category,admin})
        req.session.categoryErr=null
        req.session.cateData=null
        req.session.editCateData=null
        }
        catch(err){
            next(err)
        }
    },

    postCategory:async(req,res,next)=>{
        try{
           let category = req.body.category
           let cate = await categoryCollection.findOne({_id:ObjectId(req.body.id)})
           let cateName = cate.category
           await productCollection.updateMany({category:cateName},{$set:{category:category}})
           await categoryCollection.updateOne({_id:ObjectId(req.body.id)},{$set:{status:false}})

           res.json({status:true})
        }
        catch(err){
            next(err)
        }
    },

    addCategory:async(req,res,next)=>{
        try{
            let cate=req.body

        let regx=/^([a-zA-Z ]){3,20}$/gm
        let category=await categoryCollection.findOne({category:{$regex:cate.category,$options:"i"}})
           
            if(cate.category==''){ 
                req.session.cateData=req.body
                req.session.categoryErr="field Empty"
                res.redirect('/admin/categories')
            }else if(regx.test(cate.category)==false){
                req.session.cateData=req.body
                req.session.categoryErr="Invalid input"
                res.redirect('/admin/categories')
            }else if(category){
                req.session.cateData=req.body
                req.session.categoryErr="Category Already Exist"
                res.redirect('/admin/categories')
            }
            else{
                categoryCollection.insertOne(cate).then(()=>{
                res.redirect('/admin/categories')
            })
            }
        }
        catch(err){
            next(err)
        }
    },

    disableCategory:async(req,res,next)=>{
        try{
            let cateId=req.params.id
            let category=await categoryCollection.findOne({_id:ObjectId(cateId)})
           console.log(category)
           let cate=category.category
        categoryCollection.updateOne({_id:ObjectId(cateId)},{$set:{status:false}})
        productCollection.updateMany({category:cate},{$set:{status:false}}).then((data)=>{
            console.log(data);
        })
        res.redirect('/admin/categories')
        }
        catch(err){
            next(err)
        }
    },

    enableCategory:async(req,res,next)=>{
        try{
            let cateId=req.params.id
            let category=await categoryCollection.findOne({_id:ObjectId(cateId)})
           console.log(category)
           let cate=category.category
        categoryCollection.updateOne({_id:ObjectId(cateId)},{$set:{status:true}})
        productCollection.updateMany({oldCategory:cate},{$set:{status:true,category:cate}}).then((data)=>{
            console.log(data);
        })
        res.redirect('/admin/categories')
        }
        catch(err){
            next(err)
        }
    },

    editCategory:async(req,res,next)=>{
        try{
            let cateId = req.params.id
        let category = await categoryCollection.findOne({ _id: ObjectId(cateId) })
        req.session.editCateData = category
        res.redirect('/admin/categories')
        }
        catch(err){
            next(err)
        }
    },

    updateCategory:async(req,res,next)=>{
        try{
            let cateId = req.params.id
            let category = await categoryCollection.findOne({ _id: ObjectId(cateId) })
            
            let cateData=category.category
            console.log(cateData);
        let cate = req.body
        categoryCollection.updateOne({ _id: ObjectId(cateId) }, { $set: { category: cate.category } })
        productCollection.updateMany({category:cateData},{$set:{category:cate.category}})
       
        res.redirect('/admin/categories')
        }
        catch(err){
            next(err)
        }
    },

    categoryDisable:async(req,res,next)=>{
        try{
            let cateId=req.params.id
            let category=await categoryCollection.findOne({_id:ObjectId(cateId)})
           console.log(category)
           let admin = req.session.admin
           let cate=category.category
           let categories= await categoryCollection.find({category:{$ne:cate}}).toArray()


        categoryCollection.findOne({_id:ObjectId(cateId)},{$set:{status:false}})
        // productCollection.updateMany({category:cate},{$set:{status:false}}).then((data)=>{
        //     console.log(data);
        // })
        res.render('admin/disableCategory',{admin,category,categories})
        }
        catch(err){
            next(err)
        }
    },

    categoryUpdate:async(req,res,next)=>{
        try{
            let cate = req.body
            let cateId = req.params.id
            let category = await categoryCollection.findOne({ _id: ObjectId(cateId) })
            let cateData=category.category
            console.log(cateData);
            console.log(cate);

        // categoryCollection.updateOne({ _id: ObjectId(cateId) }, { $set: { category: cate } })
            productCollection.updateMany({category:cateData},{$set:{category:cate.category}})
       
        res.redirect('/admin/categories')
        }
        catch(err){
            next(err)
        }
    },

    deleteCategory:(req,res)=>{
        let cateId=req.params.id
        categoryCollection.deleteOne({ _id: ObjectId(cateId) })
        res.redirect('/admin/categories')
    },

    

    

    // mergeCategory:(req,res)=>{
    //     let cateId=req.params.id
    //     categoryCollection.
    //     res.redirect('/admin/categories')
    // },
   

    

}