//jshint esversion:6
require('dotenv').config();
require('./oauth.js');
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const exp = require("constants");

//const mongoose = require("mongoose");
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const connectEnsureLogin = require('connect-ensure-login');// authorization
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-find-or-create');

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret: "Our little secret is.",
    resave:false,
    saveUninitialized: true,
    cookie: {} 
}));

const User = require('./models/User');
// mongoose.set('strictQuery', false);
// mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true}).then(console.log("Connected to local MongoDB"));

// const userSchema = new mongoose.Schema({
//     email: String,
//     password: String
// });

// userSchema.plugin(passportLocalMongoose); // Hash & salt our passwords.
// userSchema.plugin(findOrCreate);

// const User = new mongoose.model("User", userSchema);

app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));



app.get("/", function(req, res){
    res.render("home");
});

// app.get("/auth/google", function(req, res){
//     console.log("In register Usrer");
//     passport.authenticate("google", { scope: ["profile"] });
// })

app.get('/auth/google', 
             passport.authenticate('google', {
               scope: ['profile']
             })              
           );

app.get("/auth/google/secrets", 
    passport.authenticate("google", {failureRedirect: "/login"}),
    function(req, res){
        res.redirect("/secrets");
    }    
);

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});

app.get("/secrets", function(req, res){

    console.log("Getting: secrets.");
    if(req.isAuthenticated()){
        console.log("req is Authenticated.");
         res.render("secrets");
    } else {
        console.log("req is not authenticated.");
        res.redirect("/login")
    }
});

app.post("/register", function(req, res){

    const userName = req.body.username;
    const password = req.body.password;

    User.register({username: userName}, password, function(err, user) {
        if(err){
            console.log("ERROR:" + err);
            res.redirect('/register');
        } else {
            passport.authenticate("local")(req, res, function(){
                console.log(req.isAuthenticated());
                res.redirect('/secrets');
            });
        }
    });


});

app.post("/login", function(req, res){
    
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err){
        if(err){
            console.log("ERROR:" + err);
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect('/secrets');
            });
        }
    });

});

app.get("/logout", function(req, res){
    req.logout((err) => {
        if(err){
            console.log("ERROR:" + err);
        }
    });
    res.redirect('/');
});


app.listen(3000, () => console.log("Server started on port 3000."));
