module.exports = handler

var debug = require('../debug').tx

function handler(req, res) {

  var max = 25;
  var wallet   = req.query.wallet;

  if (!wallet) {
    wallet = res.locals.config.wallet;
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

  res.locals.sequelize.query(walletsSql,  { replacements: { wallet: wallet, source: source } }).then(function(bal) {
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
        turtle += '  <https://w3id.org/cc#timestamp> <' + bal[0][i].timestamp + '> ;\n';
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


}
