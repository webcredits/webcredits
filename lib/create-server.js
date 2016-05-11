module.exports = createServer

// requires
var Sequelize  = require('sequelize')
var express    = require('express')
var bodyParser = require('body-parser')
var https      = require('https')
var fs         = require('fs')

var wc         = require('../lib/webcredits')
var createApp  = require('./create-app')


/**
* setup database
* @param  {string} dialect type of db mysql|sqlite
* @param  {string} storage file used for sqlite, default ./credit.db
* @return {Object} sequelize db object
*/
function setupDB(config) {
  var sequelize
  var defaultStorage = 'credit.db'

  if (config.dialect === 'sqlite') {
    if (!config.storage) {
      config.storage = defaultStorage
    }

    sequelize = new Sequelize(config.database, config.username, config.password, {
      host: config.host,
      dialect: config.dialect,
      storage: config.storage,
      logging: true,

      pool: false

    })
  } else {
    sequelize = new Sequelize(config.database, config.username, config.password, {
      host: config.host,
      dialect: config.dialect,
      logging: true,

      pool: false

    })
  }
  return sequelize
}


/**
* start server
* @param  {Object} sequelize db object
*/
function startServer(sequelize, config, port) {
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
  sequelize = setupDB(config)
  server = startServer(sequelize, config, port)
  return server

}
