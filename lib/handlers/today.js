module.exports = handler

var debug = require('../debug').today

function handler(req, res) {

  var origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  var defaultCurrency = res.locals.config.currency || 'https://w3id.org/cc#bit';

  var source   = req.query.source;

  if (!source) {
    res.send('source required');
    return;
  }

  if (!res.locals.config.wallet) {
    res.locals.config.wallet = null;
  }

  var balanceSql = 'Select sum(amount) amount from Credit where destination = :source and DATE(timestamp) = CURDATE() and wallet = :wallet ;';

  res.locals.sequelize.query(balanceSql,  { replacements: { wallet: res.locals.config.wallet, source: source } }).then(function(bal) {
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


}
