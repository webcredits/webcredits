#!/usr/bin/env node

/*
* gitpay calls child script
*
* @param {String} argv[2] command
* @callback {bin~cb} callback
**/
function command(argv, callback) {
  var comm = argv[2];
  var exec;

  if (!comm) {
    console.log('Usage: credit command [args]');
    process.exit(-1);
  }
  exec = require('./bin/' + comm + '.js');

  argv.splice(2, 1);

  exec(argv, callback);

}

/*
* git-pay as a command
*
**/
function bin() {
  command(process.argv, function(err, res){
    console.log(res);
  });
}

// If one import this file, this is a module, otherwise a library
if (require.main === module) {
  bin(process.argv);
}

module.exports = command;
