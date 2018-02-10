const express = require('express');
const bodyParser= require('body-parser');
const session= require('express-session');

var morgan= require('morgan');



var app = new express();

//DEVELOPMENT TOOLS
app.use(morgan('dev'));

//Set Secret Key
app.use(session({cookie: { path: '/', httpOnly: true, maxAge: null}, secret:'@#$fdgdfgIUTYYDHJasdkjdasd25698745366',resave: true,
    saveUninitialized: true}));

//REQUEST PARSER
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//STATIC FILE PATH
app.use('/public', express.static('public'));
app.set('view engine', 'ejs');


//-------------------------ROUTES--------------------------//
//---------------------------------------------------------//
app.use('/hastyparking',require('./app/routes/router.js'));
app.use('/admin',require('./app/routes/routerAdmin.js'));
app.use('/website',require('./app/routes/routerWeb.js'));


//SERVER START
app.listen(8080, "0.0.0.0");
console.log("Working!! Server Running On localhost:8080");
