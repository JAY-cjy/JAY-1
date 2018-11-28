var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var ignoreRouter = require('./config/ignoreRouter');
//引入自定义模块

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//自己实现的中间件函数，用来实现判断用户是否登录(通过cookie里面的nickname)
app.use(function (req, res, next) {
  //获取cookie的方法
  //req.get('Cookie')是字符串
  //console.log(req.cookies.nickname);//中间件cookieParser的方法
  if (ignoreRouter.indexOf(req.url) > -1) {
    next();
    return;
  }//忽略登录注册和登录注册操作页面

  var nickname = req.cookies.nickname;
  if (nickname) {
    next();
  } else {
    //如果nickname不存在，就跳转到登录页面
    res.redirect('/login.html')
  }
});


app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
