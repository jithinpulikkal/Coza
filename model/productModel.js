const mongoose=require('mongoose')

let productSchema=new mongoose.Schema({
    product:{
        type:String,
        required:true
    },
    brabd:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    disabled: {
        type: Boolean,
        default: false
    },
    stock:{
        type:Number,
        required:true
    },
    rating:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    discount:{
        type:Number,
        required:true
    },
    Images:{
        type:Array,
        required:true 
    },
    size:{
        type:Array,
        required:true
    },
    oldCategory:{
        type:String,
        required:true
    // },
    // Imagess:{
    //     type:String,
    //     required:true
    }

})

const product=mongoose.model('product',productSchema).collection
module.exports=product