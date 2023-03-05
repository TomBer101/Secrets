//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const exp = require("constants");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();


app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

mongoose.set('strictQuery', false);
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true}).then(console.log("Connected to local MongoDB"));

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const secret = "Thisisoutlittlesecret.";
userSchema.plugin(encrypt, { secret: secret, encryptedFields:["password"]});

const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", function(req, res){
    const newUser = new User({
        email: req.body.username,
        password:req.body.password
    })

    newUser.save()
    .then(function(user){
        //console.log("The user " + newUser + " was created.");
        res.render("secrets");
    })
    .catch((err) => {
        if (err){
            console.log(err);
        }
    });

});

app.post("/login", function(req, res){
    const userName = req.body.username;
    const password = req.body.password;

    User.findOne({email: userName})
        .then((user) => {
            if(user){
                if (user.password === password){
                    res.render("secrets");
                }
            }
        })
        .catch((err) => console.log("err"));

});


app.listen(3000, () => console.log("Server started on port 3000."));