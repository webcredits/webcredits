#!/usr/bin/env node

// requires
var webcredits = require('../lib/webcredits.js');


/**
 * version as a command
 */
function bin(argv) {
  // setup config
  var config = require('./dbconfig.js');

  webcredits.createDB(config);
}

// If one import this file, this is a module, otherwise a library
if (require.main === module) {
  bin(process.argv);
}
