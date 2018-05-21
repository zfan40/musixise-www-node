'use strict';

const messages = require('./controllers/messages');
const Home = require('./controllers/home');
const Musician = require('./controllers/musician');
const Stage = require('./controllers/stage');
const Events = require('./controllers/events');

const compress = require('koa-compress');
const logger = require('koa-logger');
const serve = require('koa-static');
const route = require('koa-route');
const koa = require('koa');
const path = require('path');
const app = koa();

// Logger
app.use(logger());

/*********    routers registration    *********/
// app.use(route.get('/', messages.home));
// app.use(route.get('/messages', messages.list));
// app.use(route.get('/messages/:id', messages.fetch));
// app.use(route.post('/messages', messages.create));
// app.use(route.get('/async', messages.delay));
// app.use(route.get('/promise', messages.promise));

/***** Home *****/
app.use(route.get('/', Home.Page.index));
// app.use(route.get('/about',Home.Page.about));

// /***** Musician *****/
// 注册音乐人
app.use(route.get('/musician/join', Musician.Page.join));
app.use(route.post('/musician/join', Musician.Page.join));
// 登陆音乐人
app.use(route.get('/musician/login', Musician.Page.login));
app.use(route.post('/musician/login', Musician.Page.login));
// 登出音乐人
app.use(route.get('/musician/logout', Musician.Page.logout));

// /***** Stage *****/
// 创建艺人舞台
app.use(route.get('/stage/:nickname', Stage.Page.create));
app.use(route.post('/stage/:nickname', Stage.Page.create));
/******* Events *******/
app.use(route.get('/domain-sale', Events.Page.sale));
/**********************************************/

// Serve static files
app.use(serve(path.join(__dirname, 'public')));

// Compress
app.use(compress());

if (!module.parent) {
  app.listen(3000);
  console.log('listening on port 3000');
}

module.exports = app;