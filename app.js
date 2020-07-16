const http = require('http');
const features = require('./models/features');
var express = require("express"),
     app = express(),
     mongoose = require("mongoose"),
     bodyparser = require("body-parser"),
     passport = require("passport"),
     localstrategy = require("passport-local"),
     flash = require("connect-flash"),
     User = require("./models/user"),
     Features = require("./models/features"),
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
app.use(bodyparser.json());

// PASSPORT CONFIGURATION
app.use(require("express-session")({
     secret: "Collection of dataset",
     resave: false,
     saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localstrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
     res.locals.currentUser = req.user;
     res.locals.error = req.flash("error");
     res.locals.success = req.flash("success");
     next();
});

app.get("/", function (req, res) {
     res.render("landing", { page: "/" });
});

app.get("/keystrokeAnalysis", isloggedin, function (req, res) {
     if (!req.user.verified) {
          console.log("not");
          var smtpTransport = nodemailer.createTransport({
               service: 'Gmail',
               auth: {
                    user: "gouravagg77@gmail.com",
                    pass: "Gourav123!"
               }
          });

          host = req.get('host');
          var link = "http://" + req.get('host') + "/verify/" + req.user._id;

          var mailOptions = {
               to: req.user.email,
               from: "gouravagg77@gmail.com",
               subject: "Registration Successful",
               html: "Hello,<br> Please Click on the link to verify your email.<br><a href=" + link + ">Click here to verify</a>",
          };

          smtpTransport.sendMail(mailOptions, function (err) {
               if (!err) {
                    //res.redirect("/keystrokeAnalysis");
               } else {
                    console.log("Mail sent unsuccesful for user_id" + req.user._id);
                    res.redirect("/register");
               }
          });
          res.send("an email has been sent please verify first")
     } else {
          if ((req.user.sessionNumber === 1) || (req.user.sessionNumber <= 3 && (new Date() - req.user.enrolledAt)) / (1000 * 60 * 60 * 24) >= 1) { res.render("index", { page: "keystroke" }); }
          else {
               if (req.user.sessionNumber == 4) {
                    res.send('Thanks for contributing you have completed the enrollment process :)');
               } else {
                    let time = new Date(req.user.enrolledAt.getTime() + 60 * 60 * 24 * 1000);
                    res.send(`Try after ${time}`);
               }
          }
     }
});

app.post("/store", isloggedin, function (req, res) {

     const data = req.body;
     if (!req.body) {
          return res.status(400).json({
               status: 'error',
               error: 'req body cannot be empty',
          });
     }

     res.status(200).json({
          status: 'succes',
          data: req.body,
     });

     const newRow = {
          features: req.body.a,
          author: {
               id: req.user._id,
               username: req.user.username
          }
     };

     Features.create(newRow, function (err, newlyCreated) {
          if (err) {
               console.log(err);
          } else {
               console.log("good work");
          }
     });
});

app.post("/keystrokeAnalysis", isloggedin, function (req, res) {

     const sessionNumber = req.user.sessionNumber;
     User.findByIdAndUpdate(req.user._id, { enrolledAt: new Date(), sessionNumber: sessionNumber + 1 }, (err) => {
          if (err) {
               console.log(err);
          }
          else {
               console.log("success");
          }
     });

     var id = req.user.email;
     console.log(id);

     let date = new Date(new Date().getTime() + 60 * 60 * 24 * 1000);
     //let date = new Date(2020,6,10,14,22);
     /*let date = new Date();
     date.setSeconds(date.getSeconds()+30);*/
     var transporter = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
               user: "gouravagg77@gmail.com",
               pass: "Gourav123!"
          }
     });

     var mailOptions = {
          to: req.user.email,
          from: "gouravagg77@gmail.com",
          subject: "Enrolment Time",
          text: "Hello, You can enrol now by clicking on the link below: ",
     };

     var j = schedule.scheduleJob(date, function () {
          transporter.sendMail(mailOptions, function (error, info) {
               if (error) {
                    console.log(error);
               } else {
                    console.log("email send");
               }
          });
     });

     req.flash("success", "Enrolment Done");
     res.redirect("/");

});

// AUTHENTICATION ROUTES

//REGISTER ROUTE
app.get("/register", function (req, res) {
     res.render("register", { page: "register" });
});

var host;
app.post("/register", function (req, res) {

     var newUser = new User({ username: req.body.username, email: req.body.email, enrolledAt: new Date(), sessionNumber: 1, verified: false });
     User.register(newUser, req.body.password, function (err, user) {
          if (err) {
               req.flash("error", err.message);
               res.redirect("/register");
          } else {
               passport.authenticate("local")(req, res, function () {
                    var smtpTransport = nodemailer.createTransport({
                         service: 'Gmail',
                         auth: {
                              user: "gouravagg77@gmail.com",
                              pass: "Gourav123!"
                         }
                    });

                    console.log("fd", req.user._id);

                    host = req.get('host');
                    var link = "http://" + req.get('host') + "/verify/" + req.user._id;

                    var mailOptions = {
                         to: req.user.email,
                         from: "gouravagg77@gmail.com",
                         subject: "Registration Successful",
                         html: "Hello,<br> Please Click on the link to verify your email.<br><a href=" + link + ">Click here to verify</a>",
                    };

                    smtpTransport.sendMail(mailOptions, function (err) {
                         if (!err) {
                              //res.redirect("/keystrokeAnalysis");
                         } else {
                              console.log("Mail sent unsuccesful for user_id" + req.user._id);
                              res.redirect("/register");
                         }
                    });
               });
          }
          passport.authenticate("local")(req, res, function () {
               //req.flash("success", "Hy! " + user.username);
               res.send("An email has been sent please check");
          });
     });
});


app.get('/verify/:user_id', function (req, res) {
     console.log(req.protocol + ":/" + req.get('host'));
     if ((req.protocol + "://" + req.get('host')) == ("http://" + host)) {
          console.log("Domain is matched. Information is from Authentic email");
          if (req.user.verified == false) {
               console.log("email is verified");

               User.findByIdAndUpdate(req.params.user_id, { verified: true }, function (err) {
                    if (err) {
                         console.log("back");
                    } else {
                         req.flash("success", "Email Verified Welcome " + req.user.username);
                         res.redirect("/");
                    }
               });
          }
          else {
               console.log("email is not verified");
               res.send("<h1>Bad Request</h1>");
          }
     }
     else {
          res.end("<h1>Request is from unknown source");
     }
});

//LOGIN ROUTE
app.get("/login", function (req, res) {
     res.render("login", { page: "login" });
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
     req.flash("success", "Logged you out!!")
     // res.redirect("/campgrounds");
     res.redirect("/login");
});

//MIDDLEWARE
function isloggedin(req, res, next) {
     if (req.isAuthenticated()) {
          return next();
     }
     req.flash("error", "You need to be logged in to do that");
     res.redirect("/login");
}

app.listen(3000, function () {
     console.log(`Server running`);
});