const http = require('http');
const hostname = '127.0.0.1';
const port = 3000;

var express = require("express"),
     app = express(),
     mongoose = require("mongoose"),
     bodyparser = require("body-parser"),
     passport = require("passport"),
     localstrategy = require("passport-local"),
     flash = require("connect-flash"),
     user = require("./models/user"),
     nodemailer = require("nodemailer"),
     schedule = require("node-schedule");


//APP CONFIGURATION
mongoose.connect("mongodb://localhost/Dummy_site", {
     useNewUrlParser: true,
     useUnifiedTopology: true,
     useCreateIndex: true,
     useFindAndModify: false
});

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyparser.urlencoded({ extended: true }));
app.use(flash());

// PASSPORT CONFIGURATION
app.use(require("express-session")({
     secret: "Collection of dataset",
     resave: false,
     saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localstrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use(function (req, res, next) {
     res.locals.currentUser = req.user;
     //res.locals.error = req.flash("error");
     //res.locals.success = req.flash("success");
     next();
});

app.get("/", function (req, res) {
     res.render("landing");
});

app.get("/keystrokeAnalysis", isloggedin, function (req, res) {
     console.log((new Date() - req.user.enrolledAt) / (1000 * 60 * 60 * 24));
     if (req.user.sessionNumber === 1 || (new Date() - req.user.enrolledAt) / (1000 * 60 * 60 * 24) >= 1)
          res.render("index");
     else {
          let time = new Date(req.user.enrolledAt.getTime() + 60 * 60 * 24 * 1000);
          res.send(`Try after ${time} hours`);
     }
});

app.post("/keystrokeAnalysis", isloggedin, function (req, res) {
     const sessionNumber = req.user.sessionNumber;
     user.findByIdAndUpdate(req.user._id, { enrolledAt: new Date(), sessionNumber: sessionNumber + 1 }, (err) => {
          if (err) {
               console.log(err);
          }
          else {
               console.log("success");
          }
     });

     console.log("abs");
     var id = req.user.email;
     console.log(id);
     res.send("successfull");
     let date = new Date(new Date().getTime() + 60 * 60 * 24 * 1000);
     //let date = new Date(2020,6,10,14,22);

     let mailOptions = {
          from: 'gouravagg77@gmail.com',
          to: id,
          subject: 'Email',
          text: 'some content'
     };
     let transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
               user: 'gouravagg77@gmail.com',
               pass: 'Plmnko098,'
          }
     });

     var j = schedule.scheduleJob(date, function () {
          transporter.sendMail(mailOptions,
               function (error, info) {
                    if (error) {
                         console.log(error);
                    } else {
                         console.log("email send");
                    }
               });
     });
});

// AUTHENTICATION ROUTES

//REGISTER ROUTE
app.get("/register", function (req, res) {
     res.render("register");
});

app.post("/register", function (req, res) {
     //console.log(req.body);
     var newUser = new user({ username: req.body.username, email: req.body.email, enrolledAt: new Date(), sessionNumber: 1 });
     user.register(newUser, req.body.password, function (err, user) {
          if (err) {
               console.log(err);
               return res.render("register");
          }
          passport.authenticate("local")(req, res, function () {
               res.redirect("/keystrokeAnalysis");
          });
     });
});

//LOGIN ROUTE
app.get("/login", function (req, res) {
     res.render("login");
});

app.post("/login", passport.authenticate("local",
     {
          successRedirect: "/keystrokeAnalysis",
          failureRedirect: "/login"
     }), function (req, res) {
          //res.render("login");
});

//LOGOUT ROUTE
app.get("/logout", function (req, res) {
     req.logout();
     //req.flash("success", "Logged you out!");
     res.redirect("/keystrokeAnalysis");
});

//MIDDLEWARE
function isloggedin(req, res, next) {
     if (req.isAuthenticated()) {
          return next();
     }
     res.redirect("/login");
}

app.listen(port, hostname, function () {
     console.log(`Server running at http://${hostname}:${port}/`);
});