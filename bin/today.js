#!/usr/bin/env node

// requires
var program    = require('commander');
var webcredits = require('../lib/webcredits.js');


/**
* version as a command
*/
function bin(argv) {
  // setup config
  var config = require('../config/dbconfig.js');

  var source = process.argv[2];

  if (!source) {
    console.error('Source is required');
    process.exit(-1);
  }

  program
  .option('-c, --currency <currency>', 'Currency')
  .option('-d, --database <database>', 'Database')
  .option('-w, --wallet <wallet>', 'Wallet')
  .parse(argv);

  var defaultCurrency = 'https://w3id.org/cc#bit';
  var defaultDatabase = 'webcredits';
  var defaultWallet   = 'https://localhost/wallet/test#this';

  config.currency = program.currency || config.currency || defaultCurrency;
  config.database = program.database || config.database || defaultDatabase;
  config.wallet   = program.wallet   || config.wallet   || defaultWallet;

  var sequelize = webcredits.setupDB(config);
  webcredits.today(source, sequelize, config, function(err, ret){
    if (err) {
      console.error(err);
    } else {
      console.log(ret);
    }
    sequelize.close();
  });

}

// If one import this file, this is a module, otherwise a library
if (require.main === module) {
  bin(process.argv);
}

module.exports = bin;
