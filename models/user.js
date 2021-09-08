const mongoose = require('mongoose')

const userSchema = mongoose.Schema({

    username : {
        type: String,
        required: true
    },
    email: {
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    cart : {
        items: [
            {
                productId:{
                    type:mongoose.Schema.Types.ObjectId,
                    ref:"Product",
                    required:true
                },
                quantity:{
                    type:Number,
                    required:true
                }
            }
        ]
    }

})

module.exports = mongoose.model("User",userSchema);