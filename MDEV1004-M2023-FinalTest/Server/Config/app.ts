//modules for express server
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

//modules for authentication
import session  from 'express-session';
import passport from 'passport';
import passprotLocal from 'passport-local';

// modules for jwt support
import cors from 'cors';
import passportJWT from 'passport-jwt';

// define JWT aliases
let JWTStrategy = passportJWT.Strategy;
let ExtractJWT = passportJWT.ExtractJwt;

// authentication objects
let localStrategy = passprotLocal.Strategy; // alias
import User from '../Models/user';

//database modules
import mongoose from 'mongoose';
import db from './db';

mongoose.connect(db.remoteURI);

//DB connection events
mongoose.connection.on('connected', () =>{
    console.log(`connected to MongoDB`);
});

mongoose.connection.on('disconnected', () =>{
    console.log(`Disconnected from MongoDB`);
})

import indexRouter from '../Routes/index';

let app = express();

//middleware modules
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(cors()); //adds CORS to the config

// setup express session
app.use(session({
    secret: db.secret,
    saveUninitialized: false,
    resave: false
   }));

   // initialize passport
app.use(passport.initialize());
app.use(passport.session());

// implement an Auth Strategy
passport.use(User.createStrategy());

// serialize and deserialize user data
passport.serializeUser(User.serializeUser() as any);
passport.deserializeUser(User.deserializeUser());

// setup JWT Options
let jwtOptions = 
{
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: db.secret
}

// setup JWT Strategy
let strategy = new JWTStrategy(jwtOptions, function(jwt_payload, done)
{
    try 
    {
        const user = User.findById(jwt_payload.id);
        if (user) 
        {
            return done(null, user);
        }
        return done(null, false);
    } 
    catch (error) 
    {
        return done(error, false);
    }
});

passport.use(strategy);

app.use('/api/', indexRouter);

export default app;
