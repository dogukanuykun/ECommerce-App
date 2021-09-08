const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const shopRouter = require("./routes/shop");
const accountRouter = require("./routes/account");
const session = require("express-session");
const User = require("./models/user");
const mongoDbStore = require("connect-mongodb-session")(session);
const csurf = require('csurf');

const connectionString = "mongodb://localhost:27017/ecommerceDB";

app.set("views", "./views");
app.set("view engine", "pug");

var store = new mongoDbStore({
  uri: connectionString,
  collection: "Sessions",
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
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



app.use(express.static(path.join(__dirname, "public")));


// app.use((req, res, next) => {
//   if (!req.session.user) {
//     next();
//   }

//   User.findById(req.session.user._id)
//     .then((user) => {
//       req.user = user;
//       next();
//     })
//     .catch((err) => {
//       console.log(err);
//     });
    
// });

app.use(csurf());

app.use(shopRouter);
app.use(accountRouter);

app.use((error,req,res,next)=>{
  res.status(500).render('error/500',{title:'Error'})
})

mongoose.connect(connectionString).then(() => {
  console.log("connected to mongodb");
  app.listen(3000);
});
