var config = require('./environment');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;

const db = require('../config/db-config');
const User = db.user;

module.exports = function(passport) {
    var opts = {};
    opts.secretOrKey = config.secret;
    opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
    passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
        User.findByPk(jwt_payload.id).then(user => {
            if (user) {
                done(null, user);
            } else {
                done(null, false);
            }
        }).catch(err => {
            return done(err, false);
        })
    }));
};
