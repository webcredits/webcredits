module.exports = handler

var debug = require('../debug').ledger

function handler(req, res) {

  var ret = '';

  var wallet   = req.query.wallet;

  if (!wallet) {
    wallet = res.locals.config.wallet;
  }

  if (!wallet) {
    res.send('wallet required');
    return;
  }

  var walletsSql = 'SELECT DISTINCT source, amount from Ledger where wallet = :wallet';

  res.locals.sequelize.query(walletsSql,  { replacements: { wallet: wallet } }).then(function(bal) {
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
}
