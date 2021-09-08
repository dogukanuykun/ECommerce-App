const User = require('../models/user');
const bcrypt = require('bcrypt');
//const sgmail = require('@sendgrid/mail');

exports.getLogin = (req,res,next) => {
    res.render('account/login',{
        title:"Login"
    })
    next();
}

exports.postLogin = (req,res,next) => {
    let email = req.body.email;
    let password = req.body.password;

    User.findOne({email:email})
        .then(user => {
            if(!user){
                return res.redirect('/login')
            } 

            bcrypt.compare(password,user.password)
                .then(isEqual => {
                    if(isEqual){
                        req.session.user = user;
                        req.session.isAuthenticated = true;
                        return req.session.save(function(err){
                            var url = req.session.redirectTo || "/";
                            delete req.session.redirectTo;
                            res.redirect('/')
                        })
                    }
                    res.redirect('/login')
                })
                .catch(err => {console.log(err)})

        }).catch(err => {console.log(err)})

}

exports.getRegister = (req,res,next) => {
    res.render("account/register",{
        title:"Register"
    })
    next();
}

exports.postRegister = (req,res,next) => {
    console.log(req.body);
    // let username = req.body.username;
    // let email = req.body.email;
    // let password = req.body.password;

    // User.findOne({email:email})
    //     .then(user => {
    //         if(user){
    //             return res.redirect('/register')
    //         }
    //         return bcrypt.hash(password,10);
    //     })
    //     .then(hashedPassword => {
    //         const newUser = new User({
    //             username:username,
    //             email:email,
    //             password:hashedPassword,
    //             cart: {items: []}
    //         })
    //         newUser.save();
    //     })
    //     .then(() => {res.redirect("/login")})
    //     .catch(err => console.log(err));
}

exports.getLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/login');
    });
}