#!/usr/bin/env node

// requires
var program    = require('commander')
var wc         = require('../')
var express    = require('express')

function bin(argv) {

  program
  .option('-c, --currency <currency>', 'Currency')
  .option('-p, --port <n>', 'Port', parseInt)
  .option('-d, --database <database>', 'Database')
  .option('-w, --wallet <wallet>', 'Wallet')
  .option('--key <key>', 'Key')
  .option('--cert <cert>', 'Cert')
  .parse(argv)

  var app
  try {
    app = wc.createServer(program)
  } catch (e) {
    if (e.code === 'EACCES') {
      console.log('You need root privileges to start on this port')
      return 1
    }
    if (e.code === 'EADDRINUSE') {
      console.log('The port ' + argv.port + ' is already in use')
      return 1
    }
    console.log(e.message)
    console.log(e.stack)
    return 1
  }

  try {
    app.listen(program.port, function () {
      console.log('Server started on port ' + program.port)
    })
  } catch (e) {
    throw new Error(e)
  }

}

// If one import this file, this is a module, otherwise a library
if (require.main === module) {
  bin(process.argv)
}

module.exports = bin
