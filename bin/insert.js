#!/usr/bin/env node

// requires
var webcredits = require('../lib/webcredits.js');


/**
* version as a command
*/
function bin(argv) {
  // setup config
  var config = require('../config/dbconfig.js');

  var credit = {};

  credit["@type"]                                = 'https://w3id.org/cc#Credit';
  credit["https://w3id.org/cc#source"]           = argv[2];
  credit["https://w3id.org/cc#amount"]           = argv[3];
  credit["https://w3id.org/cc#currency"]         = argv[4];
  credit["https://w3id.org/cc#destination"]      = argv[5];
  credit["http://purl.org/dc/terms/description"] = argv[6];
  credit["https://w3id.org/cc#timestamp"]        = argv[7];


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

  var sequelize = webcredits.createDB(config);
  webcreditsinsert(credit, sequelize, config);

}

// If one import this file, this is a module, otherwise a library
if (require.main === module) {
  bin(process.argv);
}

module.exports = bin;
