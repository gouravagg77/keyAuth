const http = require('http');
const hostname = '127.0.0.1';
const port = 3000;

var express       = require("express"),
    app           = express(),
    mongoose      = require("mongoose"),
    bodyparser    = require("body-parser"),
    passport      = require("passport"),
    localstrategy = require("passport-local"),
    flash         = require("connect-flash"),
    user          = require("./models/user");
   

//APP CONFIGURATION
mongoose.connect("mongodb://localhost/Dummy_site" , {useNewUrlParser: true,
   useUnifiedTopology: true,
   useCreateIndex: true,
   useFindAndModify: false}); 

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyparser.urlencoded({extended: true}));
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

app.use(function(req , res , next){
  res.locals.currentUser = req.user;
  //res.locals.error = req.flash("error");
  //res.locals.success = req.flash("success");
  next();
});

app.get("/" , function(req,res){
     res.render("landing");
});

app.get("/keystrokeAnalysis" ,isloggedin, function(req,res){
     res.render("index");
});

app.post("/keystrokeAnalysis" ,isloggedin, function(req,res){
     res.send("successfull");
});

// AUTHENTICATION ROUTES

//REGISTER ROUTE
app.get("/register" , function(req,res){
     res.render("register");
});

app.post("/register" , function(req,res){
	//console.log(req.body);
     var newUser = new user({username: req.body.username ,email: req.body.email});
     user.register(newUser, req.body.password, function(err, user){
     	if(err){
     		console.log(err);
     		return res.render("register");
     	}
     	passport.authenticate("local")(req, res, function(){
     		res.redirect("/keystrokeAnalysis");
     	});
     });
});

//LOGIN ROUTE
app.get("/login" , function(req,res){
     res.render("login");
});

app.post("/login" ,passport.authenticate("local",
{  
   successRedirect: "/keystrokeAnalysis",
   failureRedirect: "/login"
}), function(req , res){
  //res.render("login");
});


//LOGOUT ROUTE
app.get("/logout" , function(req, res){
   req.logout();
   //req.flash("success", "Logged you out!");
   res.redirect("/keystrokeAnalysis");
});

//MIDDLEWARE
function isloggedin(req , res , next){
  if(req.isAuthenticated()){
      return next();
  }
  res.redirect("/login");
}


app.listen(port, hostname, function(){
  console.log(`Server running at http://${hostname}:${port}/`);
});    






// <h1>Login Form!</h1>

// <form action="/login" method="post">
//   <input type="text" name="username" placeholder="username">  
//   <input type="email" name="email" placeholder="email"> 
//   <input type="password" name="password" placeholder="password">
//   <input type="submit" value="Login!">  
// </form>   
// <h1>Sign Up!</h1>

// <form action="/register" method="post">
//   <input type="text" name="username" placeholder="username">  
//   <input type="email" name="email" placeholder="email"> 
//   <input type="password" name="password" placeholder="password">
//   <button>Sign Up!</button> 
// </form>
// <li><a href="#">Signed In As <%= currentUser.username %></a></li>