const {
    Strategy,
    ExtractJwt
} = require('passport-jwt');
const config = require('../config');
//set up options of passport
const opts = {

    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.jwtSecret
}
module.exports = (passport) => {
    passport.use(new Strategy(opts, async (jwt_payload, done) => {
        //If the token has expiration, raise unauthorized
        let expirationDate = new Date(jwt_payload.exp * 1000)
        if (expirationDate < new Date()) {
            return done(null, false);
        } else {
            let user = JSON.parse(JSON.stringify(jwt_payload))
            return done(null, user)
        }
    }))
}