require('dotenv').config();
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const shopRouter = require("./routes/shop");
const accountRouter = require("./routes/account");
const session = require("express-session");
const User = require("./models/user");
const mongoDbStore = require("connect-mongodb-session")(session);
const csurf = require("csurf");
const errorController = require('./controllers/errors');
const passport = require('passport')
const passportLocal = require('passport-local');
const GoogleStrategy = require('passport-google-oauth20').Strategy;


const connectionString = process.env.CONNECTION_STRING;

app.set("views", "./views");
app.set("view engine", "pug");

app.use(express.static(path.join(__dirname, "public")));

var store = new mongoDbStore({
  uri: connectionString,
  collection: "Sessions",
});

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 3600000,
    },
    store: store,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());

passport.serializeUser(function(user,done){
  done(null, user.id);
})

passport.deserializeUser(function(id,done){

  User.findById(id, function(err, user) {
    done(err, user);
    
  });

})

passport.use('google',new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.callbackURL,
  userProfileURL:process.env.userProfileURL
},
function(accessToken, refreshToken, profile, cb) {
  
  User.findOrCreate({ googleId: profile.id }, function (err, user) {
    return cb(err, user);
  }); 

}
));

app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
);

app.get("/auth/google/callback",
  passport.authenticate('google', { failureRedirect: "/login", session:true}),
  function(req, res) {
    // Successful authentication, redirect to home.
    req.session.isAuthenticated = true;
    res.redirect("/");
  });

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }

  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
    });

});

app.use(csurf());

app.use(shopRouter);
app.use(accountRouter);
app.use(errorController.get404Page);
app.use('/500', errorController.get500Page);

app.use((error, req, res, next) => {
  console.log(error);
  res.status(500).render('error/500', { title: 'Error' });
});

mongoose.connect(connectionString).then(() => {
  console.log("connected to mongodb");
  app.listen(3000);
});
