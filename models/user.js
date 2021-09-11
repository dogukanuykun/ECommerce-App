const mongoose = require('mongoose');
const {isEmail} = require('validator');
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate');

const userSchema = mongoose.Schema({

    username : {
        type: String
    },
    email: {
        type:String,
        validate: [isEmail,'Invalid Email']
    },
    password:{
        type:String
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    googleId: String,
    resetToken:String,
    resetTokenExpiration:Date,
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

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


userSchema.methods.addToCart = function (product) {
    const index = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === product.id.toString()
    });

    const updatedCartItems = [...this.cart.items];

    let itemQuantity = 1;
    if (index >= 0) {
        // cart zaten eklenmek istenen product var: quantity'i arttır
        itemQuantity = this.cart.items[index].quantity + 1;
        updatedCartItems[index].quantity = itemQuantity;

    } else {
        // updatedCartItems!a yeni bir eleman ekle
        updatedCartItems.push({
            productId: product.id,
            quantity: itemQuantity
        });
    }

    this.cart = {
        items: updatedCartItems
    };

    return this.save();
}

userSchema.methods.getCart = function () {

    const ids = this.cart.items.map(i => {
        return i.productId;
    });
    
    return Product
        .find({
            _id: {
                $in: ids
            }
        })
        .select('title price image')
        .then(products => {
            return products.map(p => {
                return {
                    name: p.name,
                    price: p.price,
                    image: p.image,
                    quantity: this.cart.items.find(i => {
                        return i.productId.toString() === p.id.toString()
                    }).quantity
                }
            });
        });

}

userSchema.methods.deleteCartItem = function (productid) {
    const cartItems = this.cart.items.filter(item => {
        return item.productId.toString() !== productid.toString()
    });

    this.cart.items = cartItems;
    return this.save();
}

userSchema.methods.clearCart = function () {
    this.cart = { items: [] };
    return this.save();
}

module.exports = mongoose.model("User",userSchema);