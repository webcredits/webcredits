module.exports = createServer

// requires
var Sequelize  = require('sequelize')
var express    = require('express')
var bodyParser = require('body-parser')
var https      = require('https')
var fs         = require('fs')

var wc         = require('../')
var createApp  = require('./create-app')


/**
* server function
* @param  {Object} config [description]
*/
function createServer(argv) {
  // vars
  var sequelize

  var config = wc.getConfig()

  var defaultCurrency = 'https://w3id.org/cc#bit'
  var defaultDatabase = 'webcredits'
  var defaultWallet   = 'https://localhost/wallet/test#this'

  config.currency = argv.currency || config.currency || defaultCurrency
  config.database = argv.database || config.database || defaultDatabase
  config.wallet   = argv.wallet   || config.wallet   || defaultWallet
  config.key      = argv.key      || null
  config.cert     = argv.cert     || null

  var port = argv.port

  // run main
  sequelize = wc.setupDB(config)

  var app = express()
  wcApp = createApp(null, sequelize, config)
  app.use('/', wcApp)

  var defaultPort = 11077
  port = port || defaultPort

  console.log(config)

  var key
  try {
    key = fs.readFileSync(config.key)
  } catch (e) {
    throw new Error('Can\'t find SSL key in ' + config.key)
  }

  var cert
  try {
    cert = fs.readFileSync(config.cert)
  } catch (e) {
    throw new Error('Can\'t find SSL cert in ' + config.cert)
  }

  var credentials = {
    key: key,
    cert: cert,
    requestCert: true
  }

  server = https.createServer(credentials, app)

  return server

}
