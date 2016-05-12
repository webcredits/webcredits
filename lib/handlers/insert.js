module.exports = handler

var debug = require('../debug').insert
var wc = require('../../')

function handler(req, res) {

  var origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  var defaultCurrency = res.locals.config.currency || 'https://w3id.org/cc#bit';

  var source      = req.body.source;
  var destination = req.body.destination;
  var currency    = req.body.currency || defaultCurrency;
  var amount      = req.body.amount;
  var timestamp   = null;
  var description = req.body.description;
  var context     = req.body.context;



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
  credit["http://purl.org/dc/terms/timestamp"] = timestamp || null;
  credit["http://purl.org/dc/terms/context"] = context || null;


  wc.insert(credit, res.locals.sequelize, res.locals.config, function(err, ret) {
    if (err) {
      res.send(err);
      return;
    } else {
      res.send(ret);
    }

  });


}
