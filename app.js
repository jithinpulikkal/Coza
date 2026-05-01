var createError = require('http-errors');
var express = require('express');
var path = require('path');
var fs = require('fs');
var os = require('os');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

var hbs=require('express-handlebars')

var usersRouter = require('./routes/user');
var adminRouter = require('./routes/admin');

require('./config/connection')
var session=require('express-session')
const fileUpload=require('express-fileupload')
const nocache=require('nocache')

var app = express();
const uploadTempDir = path.join(os.tmpdir(), 'coza-uploads');

fs.mkdirSync(uploadTempDir, { recursive: true });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.set('trust proxy', 1);

app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/'}))
app.use(session({
  secret: process.env.SESSION_SECRET || "key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60000,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
}))

app.use(fileUpload({
  useTempFiles:true,
  tempFileDir: uploadTempDir
}))       

app.use(nocache())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', usersRouter);
app.use('/admin', adminRouter);

app.use(function(req, res, next) {
  next(createError(404, 'Page not found'));
});

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
  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }
  // render the error page
  res.status(err.status || 500);
  res.render('error',{status:err.status,login:true});
});



module.exports = app;
