const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const flash = require('connect-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');

require('./config/passport')(passport);

//MongoDB Config 
const db = require('./config/keys').MongoURI;

//MongoDB Connect
mongoose.connect(db,{useNewUrlParser:true})
    .then(()=> console.log('MongoDB connected'))
    .catch(err => console.log(err));

//EJS
app.set("view engine", "ejs");

app.use(express.static(__dirname +'/public'));

//express session
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie:{ maxAge: 180 * 60 * 1000 }
}));

//bodyParser
app.use(bodyParser.urlencoded({extended:true}));

//passport
app.use(passport.initialize());
app.use(passport.session());

//flash messages
app.use(flash());
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

app.use(function( req, res, next){
    res.locals.session = req.session;
    next();
});

//Routes
app.use('/',require('./routes/landing'));
app.use('/user',require('./routes/user'));

const PORT = process.env.PORT || 5500;

app.listen(PORT,() => {
    console.log(`SERVER RUNNING ON PORT ${PORT}`);
});
