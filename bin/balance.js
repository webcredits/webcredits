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

  var source = process.argv[2];

  if (!source) {
    console.error('Source is required');
    process.exit(-1);
  }

  program
  .option('-d, --database <database>', 'Port')
  .parse(argv);

  var defaultDatabase = 'webcredits';

  config.database = program.database || config.database || defaultDatabase;

  webcredits.balance(source, config);

}

// If one import this file, this is a module, otherwise a library
if (require.main === module) {
  bin(process.argv);
}

module.exports = bin;
