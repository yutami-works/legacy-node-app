const createError = require('http-errors');
const express = require('express');
const path = require('node:path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const expressSession = require('express-session');

// loading .env
require('dotenv').config();
// ignore ssl error
//process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

const loginRouter = require('./routes/login');
const sessionCheck  = require('./routes/session-check');
const indexRouter = require('./routes/index');
const logoutRouter = require('./routes/logout');
const excelRouter = require('./routes/excel');
const logRouter = require('./routes/log');
const downloadRouter = require('./routes/download');
//const formRouter = require('./routes/form');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// session
const sessionOption = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 25 * 60 * 1000 } // limit(ms)
};
const session = expressSession(sessionOption);
app.session = session; // for Socket.IO
app.use(session);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// for client side from node_modules
app.use('/bootstrap', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/')));
app.use('/fortawesome', express.static(path.join(__dirname, '/node_modules/@fortawesome/fontawesome-free/')));

app.use('/login', loginRouter);
app.use('/logout', sessionCheck, logoutRouter);
app.use('/', sessionCheck, indexRouter);
app.use('/excel', sessionCheck, excelRouter);
app.use('/log', sessionCheck, logRouter);
app.use('/download', sessionCheck, downloadRouter);
//app.use('/form', sessionCheck, formRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
