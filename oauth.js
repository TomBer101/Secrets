const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const User =  require('./models/User');
passport.use(User.createStrategy());

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

 // Used to stuff a piece of information into a cookie
 passport.serializeUser((user, done) => {
    done(null, user)
});

// Used to decode the received cookie and persist session
passport.deserializeUser((user, done) => {
    done(null, user)
});

