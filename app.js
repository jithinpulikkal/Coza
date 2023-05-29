var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var hbs=require('express-handlebars')

var usersRouter = require('./routes/user');
var adminRouter = require('./routes/admin');

var db=require('./config/connection')
var session=require('express-session')
const fileUpload=require('express-fileupload')
const nocache=require('nocache')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/'}))
app.use(session({secret:"key",resave:true,saveUninitialized:true,cookie:{maxAge:24*60*60000}}))

app.use(fileUpload({
  useTempFiles:true,
  tempFileDir:'/temp/'
}))       

app.use(nocache())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', usersRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler 
// app.use(function(req, res, next) {
//   next(createError(404));
// });

let hb=hbs.create({})
hb.handlebars.registerHelper('eq', function (a,b) {
  return a==b;
 });

 hb.handlebars.registerHelper('gt',function(a,b){
  return a>=b;
 })

 hb.handlebars.registerHelper('mul',function(a,b){
  return a*b
 })

 hb.handlebars.registerHelper('inc',function(a){
  return a+1
 })
 hb.handlebars.registerHelper('minus',function(a,b){
  return a-b
 })

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log(err);
  // render the error page
  res.status(err.status || 500);
  res.render('error',{status:err.status,login:true});
});



module.exports = app;
