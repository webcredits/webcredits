module.exports = createApp

var express = require('express')
var session = require('express-session')
var uuid = require('uuid')
var cors = require('cors')
var vhost = require('vhost')
var path = require('path')
var WcMiddleware = require('./WcMiddleware')
var Sequelize  = require('sequelize');
var express    = require('express');
var program    = require('commander');
var bodyParser = require('body-parser');
var https      = require('https');
var fs         = require('fs');
var wc         = require('../')

var home       = require('./handlers/home')
var ledger     = require('./handlers/ledger')
var tx         = require('./handlers/tx')
var balance    = require('./handlers/balance')
var today      = require('./handlers/today')
var insert     = require('./handlers/insert')



var corsSettings = cors({
  methods: [
    'OPTIONS', 'HEAD', 'GET', 'PATCH', 'POST', 'PUT', 'DELETE'
  ],
  exposedHeaders: 'User, Location, Link, Vary, Last-Modified, ETag, Accept-Patch, Updates-Via, Allow, Content-Length',
  credentials: true,
  maxAge: 1728000,
  origin: true
})

function createApp (argv, sequelize, config) {
  var app = express()

  // Session
  var sessionSettings = {
    secret: uuid.v1(),
    saveUninitialized: false,
    resave: false
  }
  sessionSettings.cookie = {
    secure: true
  }

  app.use(session(sessionSettings))
  app.use('/', WcMiddleware(corsSettings))

  app.use( bodyParser.json() )       // to support JSON-encoded bodies
  app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
  }))

  app.use(function(req,res, next) {
    res.locals.sequelize = sequelize;
    res.locals.config = config;
    next();
  });

  app.get('/', home)
  app.get('/ledger', ledger)
  app.get('/tx', tx)
  app.get('/balance', balance)
  app.get('/today', today)
  app.post('/insert', insert)
  app.post('/inbox/', insert);
  app.post('/mark', insert);

  return app
}
