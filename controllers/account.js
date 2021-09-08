const User = require('../models/user');
const bcrypt = require('bcrypt');
const sgmail = require('@sendgrid/mail');
const crypto = require('crypto');

const developerEmail = "uykundogukan@gmail.com"
sgmail.setApiKey("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")

exports.getLogin = (req,res,next) => {
    var errorMessage = req.session.errorMessage
    delete req.session.errorMessage
    res.render('account/login',{
        title:"Login",
        errorMessage : errorMessage
    })
    next();
}

exports.postLogin = (req,res,next) => {
    let email = req.body.email;
    let password = req.body.password;

    User.findOne({email:email})
        .then(user => {
            if(!user){
                req.session.errorMessage = "No registered account found.";
                req.session.save(function(err){
                    console.log(err);
                    return res.redirect('/login')
                });
                
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
    var errorMessage = req.session.errorMessage
    delete req.session.errorMessage
    res.render("account/register",{
        title:"Register",
        errorMessage: errorMessage
    })
    next();
}

exports.postRegister = (req,res,next) => {
    //console.log(req.body);
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;

    User.findOne({email:email})
        .then(user => {
            if(user){
                req.session.errorMessage = "There is an account registered with the corresponding e-mail.";
                req.session.save(function(err){
                    console.log(err);
                    return res.redirect('/register')
                })
            }
            return bcrypt.hash(password,10);
        })
        .then(hashedPassword => {
            const newUser = new User({
                username:username,
                email:email,
                password:hashedPassword,
                cart: {items: []}
            })
            newUser.save();
        })
        .then(() => {

            res.redirect("/login")

            const msg = {
                to: email, // Change to your recipient
                from: developerEmail, // Change to your verified sender
                subject: 'Registration',
                html: '<strong>Registration is successful!</strong>',
              }
              sgMail
                .send(msg)
                .then(() => {
                  console.log('Email sent')
                })
                .catch((error) => {
                  console.error(error)
                })


        })
        .catch(err => console.log(err));
}

exports.getLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/login');
    });
}

exports.getReset = (req,res,next) => {
    var errorMessage = req.session.errorMessage;
    delete req.session.errorMessage
    res.render('account/reset',{
        path: "reset-password",
        title:"Reset Password",
        errorMessage: errorMessage,
        csrfToken: req.session.csrfToken
    });
}

exports.postReset = (req,res,next) => {
    const email = req.body.email
    crypto.randomBytes(32,(err,buffer) => {
         if(err){
             console.log(err);
            return res.redirect("/reset-password")
        }
        const token = buffer.toString('hex');

        User.findOne({email:email})
            .then(user => {
                if(!user){
                    req.session.errorMessage = "Email address not found";
                    req.session.save(function(err){
                        console.log(err);
                        return res.redirect('/reset-password');
                    });
                }

                user.resetToken = token;
                user.resetTokenExpiration = Date.now()+3600000

                return user.save();

            }).then(result => {
                res.redirect('/');
                const msg = {
                    to:email,
                    from:developerEmail,
                    subject:"Password Reset",
                    html:`
                        <p>To reset your password, please link below.</p>
                        <p>
                            <a href="http://localhost:3000/reset-password/${token}">Reset Password</a>
                        </p>
                    `
                }
                sgmail.send(msg);
            }).catch(err => {console.log(err)})

     })

}