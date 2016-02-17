#!/usr/bin/env node

// requires
var webcredits = require('../lib/webcredits.js');
var program    = require('commander');


/**
* version as a command
*/
function bin(argv) {
  // setup config
  var config = require('../config/dbconfig.js');

  var credit = {};

  program
  .arguments('<source> <amount> <currency> <destination> [description] [timestamp]')
  .option('-d, --database <database>', 'Database')
  .option('-w, --wallet <wallet>', 'Wallet')
  .action(function(source, amount, currency, destination, description, timestamp, options){
    credit["@type"]                                = 'https://w3id.org/cc#Credit';
    credit["https://w3id.org/cc#source"]           = source;
    credit["https://w3id.org/cc#amount"]           = amount;
    credit["https://w3id.org/cc#currency"]         = currency;
    credit["https://w3id.org/cc#destination"]      = destination;
    credit["http://purl.org/dc/terms/description"] = description;
    credit["https://w3id.org/cc#timestamp"]        = timestamp;


    // clean and validate
    if (!credit["https://w3id.org/cc#source"]) {
      console.error('source is required');
      process.exit(-1);
    }

    if (!credit["https://w3id.org/cc#amount"] || isNaN(credit["https://w3id.org/cc#amount"]) ) {
      console.error('amount is required and must be a number');
      process.exit(-1);
    }

    if (!credit["https://w3id.org/cc#currency"]) {
      credit["https://w3id.org/cc#currency"] = 'https://w3id.org/cc#bit';
    }

    if (!credit["https://w3id.org/cc#destination"]) {
      console.error('destination is required');
      process.exit(-1);
    }


    var defaultDatabase = 'webcredits';
    var defaultWallet   = 'https://localhost/wallet/test#this';

    config.database = program.database || config.database || defaultDatabase;
    config.wallet   = program.wallet   || config.wallet   || defaultWallet;

    var sequelize = webcredits.setupDB(config);
    webcredits.insert(credit, sequelize, config, function(err, ret) {
      if (err) {
        console.error(err);
      } else {
        console.log(ret);
      }
      sequelize.close();
    });

  })
  .parse(argv);



}

// If one import this file, this is a module, otherwise a library
if (require.main === module) {
  bin(process.argv);
}

module.exports = bin;
