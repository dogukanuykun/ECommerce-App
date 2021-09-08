const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name:{
        type:String,
        required:[true,'Ürün ismi girmelisiniz.'],
        minlength:[5,"Ürün ismi için minimum 5 karakter girmelisiniz."],
        maxlength:[255,"Ürün ismi için maksimum 255 karakter girebilirsiniz."],
        trim:true
    },
    price:{
        type:Number,
        required:function(){
            return this.isActive
        }
    },
    description:String,
    imageUrl:String,
    date:{
        type:Date,
        default:Date.now
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    isActive:Boolean,
    tags: {
        type:Array,
        validate:{
            validator: function(value){
                return value && value.length>0
            },
            message:"Ürün için en az 1 etiket giriniz."
        }
    },
    categories:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Category',
            required:false
        }
    ]
})



module.exports = mongoose.model('Product',productSchema);