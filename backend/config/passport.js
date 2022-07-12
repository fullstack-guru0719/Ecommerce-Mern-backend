import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth2'
import User from '../models/userModel.js'

/**
 * Google Auth Part
 */
passport.use(
  new GoogleStrategy({
    clientID : process.env.GOOGLE_CLIENT_ID,
    clientSecret : process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BASE_SERVER_URL}/${process.env.GOOGLE_CALLBACK_URL}`
  },
  (accessToken, refreshToken, profile, done) => {
    /**
     * profile: the profile from the Google Account
     */
    User.findOne({email: profile.email})
      .then(user => {
        if(user) {
          return done(null, user)
        }

        const newUser = new User({
          provider: 'google',
          googleId : profile.id,
          email: profile.email,
          name: profile.name,
          password: null
        })

        newUser.save((err, user) => {
          if(err) {
            return done(err, false)
          }

          return done(null, user)
        })
      })
      .catch(err => {
        return done(err, false)
      })
  })
)