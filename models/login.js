const mongoose = require('mongoose');
const {isEmail} = require('validator');

const loginSchema = mongoose.Schema({
    email:{
        type:String,
        required:[true,"Email girmelisiniz."],
        validate:[isEmail,"Hatalı Email"]
    },
    password: {
        type: String,
        required:[true,"Parola girmelisiniz."]
    }
})

module.exports = mongoose.model('Login',loginSchema);