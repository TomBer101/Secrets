//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const exp = require("constants");

const mongoose = require("mongoose");
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const connectEnsureLogin = require('connect-ensure-login');// authorization


const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret: "Our little secret is.",
    resave:false,
    saveUninitialized: false,
    cookie: {} 
}));

app.use(passport.initialize());
app.use(passport.session())

mongoose.set('strictQuery', false);
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true}).then(console.log("Connected to local MongoDB"));

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose); // Hash & salt our passwords.

const User = new mongoose.model("User", userSchema);

passport.use(newUser.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res){
    res.render("home");
});

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

    //res.render("secrets");

});

// app.post("/register", registerUser, passport.authenticate('local', {failureRedirect: '/register', failureMessage: true}), function(req, res){
//     res.redirect("/secrets");
// });

function registerUser(req, res, next){

    console.log("In register Usrer");
    User.register({username: req.body.username}, req.body.password, function(err, user){
        console.log("The user " + user + " is now registerd.");
        console.log("The ERROR object is: " + err);
        if(err){
            console.log("Error -> redirecting to register.");
        }
    });
    next();
}

function authenticateUser(req, res){

}

app.post("/register", function(req, res){

    const userName = req.body.username;
    const password = req.body.password;
    // User.register({username: req.body.username}, req.body.password, function(err, user) {

    //     console.log("The user " + user + " is now registerd.");
    //     console.log("The ERROR object is: " + err);

    //     if(err){
    //         console.log(err + "_____ Redirecting: register.");
    //         res.redirect('/register');
    //     } else {
    //         passport.authenticate("local", { failureRedirect: '/register' }, function (req, res) {
    //             console.log("In here");
    //             console.log(req.user);
    //             res.redirect('/secrets');
    //         }
    //     )}
    //   });

    User.register({username: userName}, password, function(err, user) {
        if(err){
            console.log("ERROR:" + err);
            res.redirect('/register');
        }
        console.log("A new user " + user);
        const authenticate = User.authenticate();
        authenticate(userName, password, function(err, result){
            if(err){
                console.log("ERROR --- " + err);
                res.redirect('/register');
            } else {
                console.log(req.isAuthenticated());
                console.log(userName);
                res.redirect('/secrets');
            }
        });
    });
});

app.post("/login", function(req, res){
    

});


app.listen(3000, () => console.log("Server started on port 3000."));

// how to aurhenticate a request using passpord local mongoose?