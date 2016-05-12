module.exports = handler

var debug = require('../debug').home

function handler(req, res) {
  var ret = ''

  var walletsSql = 'SELECT DISTINCT wallet from Ledger'

  res.locals.sequelize.query(walletsSql,  { replacements: { } }).then(function(bal) {
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
}
