var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var apiFilter = require('./routes/api-filter');
var authFilter = require('./routes/auth-filter');
var filesFilter = require('./routes/files-filter.js');
// var uploadFilter = require('./routes/uploader-filter.js');
// var exportExcel = require('./routes/export-excel.js');
var index = require('./routes/index');
var compression = require('compression');
var app = express();
//schedule
var schedule = require('node-schedule');
var fse = require('fs-extra');
//在每周日晚上0点清除图片;
var j = schedule.scheduleJob({hour: 0, minute: 0, dayOfWeek: 0}, function(){
  fse.emptyDir('./public/avatar', function(err){
    if(err){
      console.log(err);
    }else{
      console.log('avatar is empty');
    }
  })
  fse.emptyDir('./public/excel', function(err){
    if(err){
      console.log(err)
    }else {
      console.log('excel is empty');
    }
  })
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//开启gzip压缩
app.use(compression());
app.use(session({
  secret: 'bugu_bus_secret',
  name: 'app',   //这里的name值得是cookie的name，默认cookie的name是：connect.sid
  cookie: {maxAge: 3600*1000 },  //设置maxAge是80000ms，即80s后session和相应的cookie失效过期
  resave: true,
  saveUninitialized: true,
  rolling: true
}));
//app.use('/',index);
app.use(express.static(path.join(__dirname, 'public')));
// app.use('/image',imageFilter);
app.use('/auth',authFilter);
app.use('/files',filesFilter);
app.use('/api',apiFilter);

// app.use('/uploader', uploadFilter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.listen(3000);

module.exports = app;
