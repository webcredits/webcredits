module.exports = createApp

var express = require('express')
var session = require('express-session')
var uuid = require('node-uuid')
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


  app.get('/', function (req, res) {
    var ret = ''

    var walletsSql = 'SELECT DISTINCT wallet from Ledger'

    sequelize.query(walletsSql,  { replacements: { } }).then(function(bal) {
      if (bal[0][0]) {
        var turtle = ''
        res.setHeader('Content-Type', 'text/turtle')
        for (var i = 0; i < bal[0].length; i++) {
          turtle += '<' + '' + '> <https://w3id.org/cc#wallet> <' + bal[0][i].wallet + '> .\n';
        }
        res.send(turtle);
      }

    }).catch(function(err){
      console.log('Getting wallets Failed.', err);
    });
  });

  app.get('/ledger', function (req, res) {
    var ret = '';

    var wallet   = req.query.wallet;

    if (!wallet) {
      wallet = config.wallet;
    }

    if (!wallet) {
      res.send('wallet required');
      return;
    }

    var walletsSql = 'SELECT DISTINCT source, amount from Ledger where wallet = :wallet';

    sequelize.query(walletsSql,  { replacements: { wallet: wallet } }).then(function(bal) {
      if (bal[0][0]) {
        var turtle = '';
        res.setHeader('Content-Type', 'text/turtle');
        for (var i = 0; i < bal[0].length; i++) {
          turtle += '<' + bal[0][i].source + '> <https://w3id.org/cc#amount> ' + bal[0][i].amount + ' .\n';
        }
        res.send(turtle);
      } else {
        res.send('no ledger found');
      }
    }).catch(function(err){
      console.log('Getting wallets Failed.', err);
      res.send('no ledger found');
    });
  });

  app.get('/tx', function (req, res) {

    var max = 25;
    var wallet   = req.query.wallet;

    if (!wallet) {
      wallet = config.wallet;
    }

    if (!wallet) {
      res.send('wallet required');
      return;
    }

    var source   = req.query.source;

    if (!source) {
      res.send('source required');
      return;
    }


    var walletsSql = 'SELECT DISTINCT * from Credit where wallet = :wallet and ( source = :source or destination = :source )';

    sequelize.query(walletsSql,  { replacements: { wallet: wallet, source: source } }).then(function(bal) {
      if (bal[0][0]) {
        var turtle = '';
        /*
        { '@id': 'ni:///sha-256;clN5SmgrdDExd2lqNG5qMzFxaUlBYi92N1VObTVUSU1WUWJMVG1Lc0RSaz0',
  source: 'https://workbot.databox.me/profile/card#me',
  amount: 5,
  currency: 'https://w3id.org/cc#bit',
  destination: 'http://melvincarvalho.com/#me',
  timestamp: Wed Jan 20 2016 10:52:55 GMT+0100 (CET),
  context: null,
  description: null,
  wallet: 'https://localhost/wallet/inartes#this' } ] ]

         */
        res.setHeader('Content-Type', 'text/turtle');

        for (var i = 0; i < bal[0].length; i++) {
          if (i===max) {
            break;
          }
          turtle += '<' + bal[0][i]['@id'] + '> a <https://w3id.org/cc#Credit> ; \n';
          turtle += '  <https://w3id.org/cc#amount> ' + bal[0][i].amount + ' ;\n';
          turtle += '  <https://w3id.org/cc#source> <' + bal[0][i].source + '> ;\n';
          turtle += '  <https://w3id.org/cc#destination> <' + bal[0][i].destination + '> ;\n';
          turtle += '  <https://w3id.org/cc#created> <' + bal[0][i].timestamp + '> ;\n';
          if (bal[0][i].context) {
            turtle += '  <https://w3id.org/cc#context> <' + bal[0][i].context + '> ;\n';
          }
          if (bal[0][i].description) {
            turtle += '  <https://w3id.org/cc#description> <' + bal[0][i].description + '> ;\n';
          }
          turtle += '  <https://w3id.org/cc#currency> <' + bal[0][i].currency + '> .\n';
        }
        res.send(turtle);
      } else {
        res.send('no tx found');
      }
    }).catch(function(err){
      console.log('Getting tx Failed.', err);
      res.send('no tx found');
    });
  });

  app.get('/balance', function (req, res) {

    var origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    var defaultCurrency = config.currency || 'https://w3id.org/cc#bit';

    var source   = req.query.source;

    if (!source) {
      res.send('source required');
      return;
    }

    if (!config.wallet) {
      config.wallet = null;
    }

    var balanceSql = 'Select source, amount from Ledger where source = :source and wallet = :wallet ;';

    sequelize.query(balanceSql,  { replacements: { wallet: config.wallet, source: source } }).then(function(bal) {
      return bal;
    }).catch(function(err){
      console.log('Balance Failed.', err);
    }).then(function(bal) {
      if (bal[0][0]) {
        //console.log('balance for ' + source + ' : ' + bal[0][0].amount);
        //var amount = Math.round(  bal[0][0].amount * 10) / 10.0;
        var turtle = '';
        var jsonld = {};

        var contentType = 'application/ld+json';

        res.setHeader('Content-Type', contentType);
        for (var i = 0; i < bal[0].length; i++) {
          turtle += '<' + bal[0][i].source + '> <https://w3id.org/cc#amount> ' + bal[0][i].amount + ' .\n';
        }


        for (i = 0; i < bal[0].length; i++) {
          jsonld["https://w3id.org/cc#source"] = source;
          jsonld["https://w3id.org/cc#amount"] = bal[0][i].amount;
          jsonld["https://w3id.org/cc#currency"] = defaultCurrency;
        }


        if (contentType === 'application/ld+json') {
          res.send(jsonld);
        }

        if (contentType === 'text/turtle') {
          res.send(turtle);
        }

      }
    });


  });

  app.get('/today', function (req, res) {


    var origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    var defaultCurrency = config.currency || 'https://w3id.org/cc#bit';

    var source   = req.query.source;

    if (!source) {
      res.send('source required');
      return;
    }

    if (!config.wallet) {
      config.wallet = null;
    }

    var balanceSql = 'Select sum(amount) amount from Credit where destination = :source and DATE(timestamp) = CURDATE() and wallet = :wallet ;';

    sequelize.query(balanceSql,  { replacements: { wallet: config.wallet, source: source } }).then(function(bal) {
      return bal;
    }).catch(function(err){
      console.log('Balance Failed.', err);
    }).then(function(bal) {
      if (bal[0][0]) {
        //console.log('balance for ' + source + ' : ' + bal[0][0].amount);
        //var amount = Math.round(  bal[0][0].amount * 10) / 10.0;
        var turtle = '';
        var jsonld = {};

        var contentType = 'application/ld+json';

        res.setHeader('Content-Type', contentType);
        for (var i = 0; i < bal[0].length; i++) {
          turtle += '<' + bal[0][i].source + '> <https://w3id.org/cc#amount> ' + bal[0][i].amount + ' .\n';
        }


        for (i = 0; i < bal[0].length; i++) {
          jsonld["https://w3id.org/cc#source"] = source;
          jsonld["https://w3id.org/cc#amount"] = bal[0][i].amount;
          jsonld["https://w3id.org/cc#currency"] = defaultCurrency;
        }


        if (contentType === 'application/ld+json') {
          res.send(jsonld);
        }

        if (contentType === 'text/turtle') {
          res.send(turtle);
        }

      }
    });



  });

  app.post('/insert', function (req, res) {

    var origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    var defaultCurrency = config.currency || 'https://w3id.org/cc#bit';

    var source      = req.body.source;
    var destination = req.body.destination;
    var currency    = req.body.currency || defaultCurrency;
    var amount      = req.body.amount;
    var created     = null;
    var description = req.body.description;



    if (!source) {
      res.send('source required');
      return;
    }

    if (!destination) {
      res.send('destination required');
      return;
    }

    if (!currency) {
      res.send('currency required');
      return;
    }

    if (!amount) {
      res.send('amount required');
      return;
    }

    if (source !== req.session.userId) {
      res.send('source must be authenticated')
      return
    }

    var credit = {};

    credit["https://w3id.org/cc#source"] = source;
    credit["https://w3id.org/cc#amount"] = amount;
    credit["https://w3id.org/cc#currency"] = currency;
    credit["https://w3id.org/cc#destination"] = destination;

    credit["http://purl.org/dc/terms/description"] = description || null;
    credit["http://purl.org/dc/terms/created"] = created || null;


    wc.insert(credit, sequelize, config, function(err, ret) {
      if (err) {
        res.send(err);
        return;
      } else {
        res.send(ret);
      }

    });


  });

  function insert (req,res) {
    var origin = req.headers.origin;
    res.setHeader('Access-Control-Allow-Origin', origin);

    var defaultCurrency = config.currency || 'https://w3id.org/cc#bit';

    var source      = req.body.source;
    var destination = req.body.destination;
    var currency    = req.body.currency || defaultCurrency;
    var amount      = req.body.amount;
    var created     = null;
    var description = req.body.description;

    console.log(req.body);

    if (!source) {
      res.send('source required');
      return;
    }

    if (!destination) {
      res.send('destination required');
      return;
    }

    if (!currency) {
      res.send('currency required');
      return;
    }

    if (!amount) {
      res.send('amount required');
      return;
    }


    var credit = {};

    credit["https://w3id.org/cc#source"] = source;
    credit["https://w3id.org/cc#amount"] = amount;
    credit["https://w3id.org/cc#currency"] = currency;
    credit["https://w3id.org/cc#destination"] = destination;

    credit["http://purl.org/dc/terms/description"] = description || null;
    credit["http://purl.org/dc/terms/created"] = created || null;


    wc.insert(credit, sequelize, config, function(err, ret) {
      if (err) {
        res.send(err);
        return;
      } else {
        res.send(ret);
      }

    });

  }

  app.post('/inbox/', insert);
  app.post('/mark', insert);



  return app
}
