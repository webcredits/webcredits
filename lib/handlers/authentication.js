module.exports = handler

var webid = require('webid/tls')
var debug = require('../debug').authentication
var error = require('../http-error')

function handler (req, res, next) {

  var certificate = req.connection.getPeerCertificate()
  console.log(certificate)
  // Certificate is empty? skip
  if (certificate === null || Object.keys(certificate).length === 0) {
    console.log('No client certificate found in the request. Did the user click on a cert?')
    setEmptySession(req)
    return next()
  }

  // Verify webid
  webid.verify(certificate, function (err, result) {
    if (err) {
      console.log('Error processing certificate: ' + err.message)
      setEmptySession(req)
      return next(error(403, 'Forbidden'))
    }
    req.session.userId = result
    req.session.identified = true
    console.log('Identified user: ' + result)
    res.set('User', req.session.userId)
    return next()
  })
}

function setEmptySession (req) {
  req.session.userId = ''
  req.session.identified = false
}
