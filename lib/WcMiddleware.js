module.exports = WcMiddleware

var express = require('express')
var authentication = require('./handlers/authentication')
var home = require('./handlers/home')

function WcMiddleware (corsSettings) {
  var router = express.Router('/')


  router.use('/', authentication)
  //router.get('/', home)

  // Errors
  //router.use(errorPages)

  // TODO: in the process of being deprecated
  // Convert json-ld and nquads to turtle
  // router.use('/*', parse.parseHandler)

  return router
}
