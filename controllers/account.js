const User = require('../models/user');
const bcrypt = require('bcrypt');
const sgmail = require('@sendgrid/mail');
const crypto = require('crypto');
const login = require('../models/login');

const developerEmail = process.env.DEVELOPER_EMAIL;
sgmail.setApiKey(process.env.MAIL_API);

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

    const loginModel = new login({
        email:email,
        password:password
    });

    //console.log(loginModel);

    loginModel
        .validate()
            .then(()=>{
                User.findOne({email:email})
                .then(user => {
                    if(!user){
                        req.session.errorMessage = "No registered account found.";
                        req.session.save(function(err){
                            //console.log(err);
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
                                return res.redirect(url)
                            })
                        }
                        req.session.errorMessage = 'Hatalı email veya parola girdiniz.';
                        req.session.save(function(err){
                            return res.redirect('/login');
                        })

                    })
                .catch(err => {console.log(err)})

                }).catch(err => {console.log(err)})
            }).catch(err=>{
                if(err.name ='ValidationError'){
                    let message = '';
                    for(field in err.erros){
                        message += err.errors[field].message + '<br>';

                    }
                    res.render('account/login',{
                        path:'login',
                        title:'Login',
                        errorMessage:message
                    })
                }else{
                    next(err);
                }
            })

    

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
            return newUser.save();
        })
        .then(() => {

            res.redirect("/login")

            const msg = {
                to: email, // Change to your recipient
                from: developerEmail, // Change to your verified sender
                subject: 'Registration',
                html: '<strong>Registration is successful!</strong>',
            };

            sgMail.send(msg);

        })
        .catch(err => {
            if(err.name = 'ValidationError'){
                let message = '';
                for(field in err.errors){
                    message += err.errors[field].message + '<br>'
                }
                res.render('account/register',{
                    path:'/register',
                    title:'Register',
                    errorMessage:message
                })
            }else{
                next(err);
            }
        });
}

exports.getLogout = (req, res, next) => {
    req.logout();
    req.session.destroy(err => {
        //console.log(err);
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
            }).catch(err => {next(err)})

     })

}

exports.getNewPassword = (req,res,next) => {

    var errorMessage = req.session.errorMessage;
    delete req.session.errorMessage

    const token = req.params.token;

    User.findOne({resetToken:token, resetTokenExpiration:{
        $gt: Date.now()
    }}).then(user=>{
        res.render('account/new-password',{
            path:'/new-password',
            title:"New Password",
            errorMessage:errorMessage,
            userId:user._id.toString(),
            passwordToken:token 
        })
    }).catch(err => {next(err)})
}

exports.postNewPassword = (req,res,next) => {
    const newPassword = req.body.password;
    const token = req.body.passwordToken;
    const userId = req.body.userId;
    let _user;

    User.findOne({
        resetToken:token,
        resetTokenExpiration:{
            $gt:Date.now()
        },
        _id:userId
    }).then(user => {
        _user = user
        return bcrypt.hash(newPassword,10)
    }).then(hashedPassword=>{
        _user.password = hashedPassword;
        _user.resetToken = undefined;
        _user.resetTokenExpiration = undefined;
        return _user.save();
    }).then(()=> {
        res.redirect('/login')
    }).catch(err => {
        next(err)
    })

}