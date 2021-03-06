const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
var LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const config = require('../config/database');

module.exports = function (passport) {
  let opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = config.secret;
  passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
    User.findById(jwt_payload.user_id, (err, user) => {
      if (err) {
        return done(err, false);
      }

      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    });
  }));

  passport.use(new LocalStrategy(
    {usernameField: 'email'},
    function(email, password, done) {
      User.findOne({ email }, function(err, user) {
        if (err) { return done(err, false); }
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }

        user.comparePassword(password, (isMatch) => {
          if (!isMatch) 
            return done(null, false, { message: 'Incorrect password.' });
          
          return done(null, user);
        })
      });
    }
  ));

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });
  
  passport.deserializeUser((id, done) => {
    UserModel.findById(id, (err, user) => {
      done(err, user);
    });
  });


}
