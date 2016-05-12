#!/usr/bin/env node

module.exports = {
  insert        : insert,
  setupDB       : setupDB,
  createDB      : createDB,
  createTables  : createTables,
  balance       : balance,
  getBalance    : getBalance,
  genesis       : genesis,
  genesisInit   : genesisInit,
  reputation    : reputation,
  getReputation : getReputation,
  getConfig     : getConfig,
  getCredit     : getCredit,
  today         : today
};


// requires
var Sequelize = require('sequelize');
var jsonld = require('jsonld');
var crypto = require('crypto');
var promises = jsonld.promises;
var dateFormat = require('dateformat');

/**
* setup database
* @param  {string} dialect type of db mysql|sqlite
* @param  {string} storage file used for sqlite, default ./credit.db
* @return {Object} sequelize db object
*/
function setupDB(config) {
  var sequelize;
  var defaultStorage = 'credit.db';

  if (config.dialect === 'sqlite') {
    if (!config.storage) {
      config.storage = defaultStorage;
    }

    sequelize = new Sequelize(config.database, config.username, config.password, {
      host: config.host,
      dialect: config.dialect,
      storage: config.storage,
      logging: false
    });
  } else {
    sequelize = new Sequelize(config.database, config.username, config.password, {
      host: config.host,
      dialect: config.dialect,
      logging: false
    });
  }
  return sequelize;
}


/**
 * gets the current config
 * @return {Object} The config
 */
function getConfig() {
  var config = require("../config/dbconfig");
  return config;
}

/**
* create tables
* @param  {Object} sequelize db object
* @param  {Object} config    config object
* @param  {Object} callback  callback
*/
function createTables(sequelize, config, callback) {

  if (!config.wallet) {
    config.wallet = null;
  }

  var coinbase = 'https://w3id.org/cc#coinbase';
  var currency = config.currency || 'https://w3id.org/cc#bit';
  var wallet   = config.wallet;
  var initial  = 1000000;


  var create_credit = 'CREATE TABLE Credit ( \
    `@id` TEXT, \
    `source` TEXT, \
    `amount` REAL, \
    `currency` VARCHAR(255) DEFAULT \''+ currency +'\', \
    `destination` TEXT, \
    `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL, \
    `context` TEXT, \
    `description` TEXT, \
    `wallet` TEXT \
  );';

  var create_ledger = 'CREATE TABLE Ledger ( \
    `source` TEXT, \
    `amount` REAL, \
    `currency` VARCHAR(255) DEFAULT \''+ currency +'\', \
    `wallet` TEXT \
  );';

  var create_genesis = 'CREATE TABLE Genesis ( \
    `source` TEXT, \
    `amount` REAL, \
    `currency` VARCHAR(255) DEFAULT \''+ currency +'\', \
    `wallet` TEXT \
  );'

  sequelize.query(create_credit).then(function(res) {
  }).then(function(){
    sequelize.query(create_ledger);
  }).then(function(){
    sequelize.query(create_genesis);
  }).then(function(){
    console.log('Sucessfully created tables!');
  }).then(function() {
    //sequelize.close();
    callback(null, 'complete');
  }).catch(function(err){
    console.log('Failed to create tables.', err);
    //sequelize.close();
    callback(err);
  });
}

/**
 * get credit
 * @param  {Object} credit    the web credit
 * @param  {Object} sequelize the DB connection
 * @param  {Object} config    the config
 * @param  {Object} callback  callback
 * @return {Object}           the web credit if exists
 */
function getCredit(credit, sequelize, config, callback) {

  if (!config.wallet) {
    config.wallet = null;
  }

  var coinbase = 'https://w3id.org/cc#coinbase';
  var currency = config.currency || 'https://w3id.org/cc#bit';
  var wallet   = config.wallet;

  var sql = 'Select * from Credit where description = :description and wallet = :wallet and currency = :currency ;';

  sequelize.query(sql,  { replacements: { currency: currency, wallet: config.wallet, description: credit["https://w3id.org/cc#description"] } }).then(function(res) {
    return res;
  }).catch(function(err){
    console.log('Not found.', err);
    callback(err);
  }).then(function(res) {
    if (res[0][0]) {
      console.log(res[0][0]);
      //sequelize.close();
      callback(null, res[0][0]);
    }
  });
}


/**
* createDB function
* @param  {Object} config   config
* @param  {Object} callback callback
*/
function createDB(config, callback) {
  // vars
  var sequelize;

  // run main
  sequelize = setupDB(config);
  createTables(sequelize, config, callback);
}

/**
 * get balance
 * @param  {String}   source    the source
 * @param  {Object}   sequelize sequelize object
 * @param  {Object}   config    config
 * @param  {Function} callback  callback
 */
function getBalance(source, sequelize, config, callback) {

  if (!config.wallet) {
    config.wallet = null;
  }

  var coinbase = 'https://w3id.org/cc#coinbase';
  var currency = config.currency || 'https://w3id.org/cc#bit';
  var wallet   = config.wallet;
  var initial  = 1000000;


  var balanceSql = 'Select sum(amount) amount from Ledger where source = :source and wallet = :wallet and currency = :currency ;';

  sequelize.query(balanceSql,  { replacements: { currency: currency, wallet: config.wallet, source: source } }).then(function(res) {
    return res;
  }).catch(function(err){
    console.log('Balance Failed.', err);
    callback(err);
  }).then(function(res) {
    if (res[0][0]) {
      //console.log(res[0][0].amount);
      //sequelize.close();
      callback(null, res[0][0].amount);
    }
  });
}

/**
 * genesis initialization
 * @param  {Object}   config   config
 * @param  {Function} callback callback
 */
function genesisInit(sequelize, config, callback) {

  if (!config.wallet) {
    config.wallet = null;
  }

  var coinbase = 'https://w3id.org/cc#coinbase';
  var currency = config.currency || 'https://w3id.org/cc#bit';
  var wallet   = config.wallet;
  var initial  = 1000000;

  var coinbaseSql = 'Insert into Ledger values ( \''+ coinbase +'\', '+ initial +', \''+ currency +'\', :wallet );';
  var genesisSql  = 'Insert into Genesis values ( \''+ coinbase +'\', '+ initial +', \''+ currency +'\', :wallet );';

  sequelize.query(coinbaseSql,  { replacements: { wallet: config.wallet } }).then(function(res) {
  }).then(function(){
    sequelize.query(genesisSql,  { replacements: { wallet: config.wallet } });
  }).then(function(){
    console.log('Genesis successful!');
  }).catch(function(err){
    console.log('Genesis Failed.', err);
    callback(err);
  }).then(function() {
    callback(null, 'complete');
    //sequelize.close();
  });
}

/**
 * genesis
 * @param  {Object}   config   config
 * @param  {Function} callback callback
 */
function genesis(sequelize, config, callback) {
  genesisInit(sequelize, config, callback);
}

 /**
  * get balance
  * @param  {String}   source    the source
  * @param  {Object}   sequelize sequelize object
  * @param  {Object}   config    config
  * @param  {Function} callback  callback
  */
function balance(source, config, callback) {
  // vars
  var sequelize;

  // run main
  sequelize = setupDB(config);
  var res = getBalance(source, sequelize, config, callback);
}


/**
 * get balance
 * @param  {String}   source    the source
 * @param  {Object}   sequelize sequelize object
 * @param  {Object}   config    config
 * @param  {Function} callback  callback
 */
function getReputation(source, sequelize, config, callback) {

  if (!config.wallet) {
    config.wallet = null;
  }

  var coinbase = 'https://w3id.org/cc#coinbase';
  var currency = config.currency || 'https://w3id.org/cc#bit';
  var wallet   = config.wallet;
  var initial  = 1000000;


  var coinbaseSql = 'Select sum(amount) amount from Credit where destination = :source and wallet = :wallet and currency = :currency  ;';

  sequelize.query(coinbaseSql,  { replacements: { currency: currency, wallet: wallet, source: source } }).then(function(res) {
    return res;
  }).catch(function(err){
    console.log('Reputation Failed.', err);
    callback(err);
  }).then(function(res) {
    if (res[0][0]) {
      callback(null, res[0][0].amount);
      //sequelize.close();
    }
  });

}

/**
 * Today's credits
 * @param  {Object}   credit    a web credit
 * @param  {Object}   sequelize db connection
 * @param  {Object}   config    config
 * @param  {Function} callback  callback
 */
function today(source, sequelize, config, callback) {

  if (!config.wallet) {
    config.wallet = null;
  }

  var coinbase = 'https://w3id.org/cc#coinbase';
  var currency = config.currency || 'https://w3id.org/cc#bit';
  var wallet   = config.wallet;
  var initial  = 1000000;

  var coinbaseSql = 'Select sum(amount) amount from Credit where destination = :source and wallet = :wallet and DATE(`timestamp`) = CURDATE() and currency = :currency ;';

  sequelize.query(coinbaseSql,  { replacements: { currency: currency, wallet: config.wallet, source: source } }).then(function(res) {
    return res;
  }).catch(function(err){
    console.log('Today Failed.', err);
    callback(err);
  }).then(function(res) {
    if (res[0][0]) {
      console.log(res[0][0].amount);
      callback(null, res[0][0].amount);
      //sequelize.close();
    }
  });
}

/**
* reputation function
* @param  {Object} config [description]
*/
function reputation(source, config) {
  // vars
  var sequelize;

  // run main
  sequelize = setupDB(config);
  var res = getReputation(source, sequelize, config);
}

/**
 * Insert into webcredits
 * @param  {Object}   credit    a web credit
 * @param  {Object}   sequelize db connection
 * @param  {Object}   config    config
 * @param  {Function} callback  callback
 */
function insert(credit, sequelize, config, callback) {

  if (!config.wallet) {
    config.wallet = null;
  }

  var coinbase = 'https://w3id.org/cc#coinbase';
  var currency = config.currency || 'https://w3id.org/cc#bit';
  var wallet   = config.wallet;
  var initial  = 1000000;


  // main
  console.log('source : ' + credit["https://w3id.org/cc#source"]);
  console.log('amount : ' + credit["https://w3id.org/cc#amount"]);
  console.log('unit : ' + credit["https://w3id.org/cc#currency"]);
  console.log('destination : ' + credit["https://w3id.org/cc#destination"]);
  console.log('description : ' + credit["https://w3id.org/cc#description"]);
  console.log('timestamp : ' + credit["https://w3id.org/cc#timestamp"]);
  console.log('wallet : ' + config.wallet);


  credit["https://w3id.org/cc#description"] = credit["https://w3id.org/cc#description"] || null;
  credit["https://w3id.org/cc#timestamp"] = credit["https://w3id.org/cc#timestamp"] || null;
  credit["https://w3id.org/cc#context"] = credit["https://w3id.org/cc#context"] || null;
  config.wallet = config.wallet || null;

  var existsSql = "SELECT * FROM Credit where source = '"+ credit["https://w3id.org/cc#source"] + "' and destination = " + ":destination" + " and amount = " + credit["https://w3id.org/cc#amount"];
  existsSql +=  " and description = :description ";
  existsSql +=  " and timestamp = :timestamp ";
  existsSql +=  " and wallet = :wallet ";
  existsSql +=  " and context = :context ";

  console.log(existsSql);

  sequelize.query(existsSql, { replacements: { description: credit["https://w3id.org/cc#description"],
  timestamp: credit["https://w3id.org/cc#timestamp"], "destination" : credit["https://w3id.org/cc#destination"], wallet: config.wallet, "context": credit["https://w3id.org/cc#context"] } }).then(function(res) {
    console.log('checking if row exists');
    console.log(res);
    if (res[0][0]) {
      console.log('row exists');
      throw ('row exists');
    } else {
      console.log('row does not exist');
      console.log('Getting balance');
      var balanceSql = "SELECT * FROM Ledger where source = '" + credit["https://w3id.org/cc#source"] + "' and wallet = :wallet ";

      return sequelize.query(balanceSql, { replacements: { wallet: config.wallet } });
    }
  }).then(function(res){
    if (res[0][0] && res[0][0].amount) {
      console.log('balance is ' + res[0][0].amount);
      if (res[0][0].amount >= credit["https://w3id.org/cc#amount"]) {
        console.log('funds available');


        if (credit["https://w3id.org/cc#timestamp"]) {
          credit["https://w3id.org/cc#timestamp"] = credit["https://w3id.org/cc#timestamp"].replace(' ', 'T');
          if (credit["https://w3id.org/cc#timestamp"].charAt(credit["https://w3id.org/cc#timestamp"].length-1) != 'Z') {
            credit["https://w3id.org/cc#timestamp"] += 'Z';
          }
        } else {
          credit["https://w3id.org/cc#timestamp"] = new Date().toISOString();
        }


        var doc = {
          "https://w3id.org/cc#timestamp": { "@value" : credit["https://w3id.org/cc#timestamp"], "@type" : "http://www.w3.org/2001/XMLSchema#dateTime" } ,
          "https://w3id.org/cc#source": { "@id": credit["https://w3id.org/cc#source"] },
          "https://w3id.org/cc#amount": { "@value" : credit["https://w3id.org/cc#amount"], "@type" : "http://www.w3.org/2001/XMLSchema#decimal" } ,
          "https://w3id.org/cc#destination": { "@id": credit["https://w3id.org/cc#destination"] },
          "https://w3id.org/cc#currency": { "@id": credit["https://w3id.org/cc#currency"] },
          "@type": "https://w3id.org/cc#Credit"
        };
        console.log(doc);
        return promises.normalize(doc, {format: 'application/nquads'});

      } else {
        throw ('not enough funds');
      }
    } else {
      throw ('could not find balance');
    }
  }).then(function(doc){
    console.log('Sucessfully normalized doc to json ld!');
    var hash = crypto.createHash('sha256').update(doc).digest('base64');
    console.log(hash);

    var id = 'ni:///sha-256;' + new Buffer(hash).toString('base64').replace('+', '-').replace('/', '_').replace('=', '');
    credit['@id'] = id;
    console.log(credit);



    var insertSql = "INSERT INTO Credit(\`@id\`, `source`, `destination`, `amount`, `timestamp`, `currency`";
    if (credit["https://w3id.org/cc#description"]) insertSql += ", `description`";
    if (credit["https://w3id.org/cc#context"]) insertSql += ", `context`";
    if (config.wallet) insertSql += ", `wallet`";
    insertSql += ") values ( '" + credit['@id'] + "', '"+ credit["https://w3id.org/cc#source"] + "' , " + ":destination" + " , " + credit["https://w3id.org/cc#amount"];
    insertSql += " , '" + dateFormat(credit["https://w3id.org/cc#timestamp"], 'yyyy-mm-dd hh:MM:ss.l') + "'" + " , '" + credit["https://w3id.org/cc#currency"] + "'";
    if (credit["https://w3id.org/cc#description"]) insertSql+= " , '" + credit["https://w3id.org/cc#description"] + "'";
    if (credit["https://w3id.org/cc#context"]) insertSql+= " , '" + credit["https://w3id.org/cc#context"] + "'";
    if (config.wallet) insertSql+= " , '" + config.wallet + "'";
    insertSql += " )";

    console.log(insertSql);

    return sequelize.query(insertSql, {replacements: { "destination" : credit["https://w3id.org/cc#destination"] } });

  }).then(function(res){
    console.log('decrementing source');
    var decrementSql = "UPDATE Ledger set amount = amount - " + credit["https://w3id.org/cc#amount"] + " where source = '"+ credit["https://w3id.org/cc#source"] + "' and wallet = :wallet";
    return sequelize.query(decrementSql, { replacements: { wallet: config.wallet } });

  }).then(function(res){
    console.log('incrementing or creating destination');
    var checkSql = "SELECT * from Ledger where `source` =  :destination and wallet = :wallet";
    return sequelize.query(checkSql, { replacements: { wallet: config.wallet , "destination" : credit["https://w3id.org/cc#destination"] }});
  }).then(function(res){
    var incrementSql;
    if (res[0][0] && !isNaN(res[0][0].amount)) {
      if (config.wallet) {
        incrementSql = "UPDATE Ledger set `amount` = `amount` + " + credit["https://w3id.org/cc#amount"] + " where `source` =  :destination and wallet = '"+ config.wallet +"'";
      } else {
        incrementSql = "UPDATE Ledger set `amount` = `amount` + " + credit["https://w3id.org/cc#amount"] + " where `source` =  `source` =  :destination";
      }
    } else {
      if (config.wallet) {
        incrementSql = "INSERT into Ledger (`source`, `amount`, `wallet`) values (:destination, "+credit["https://w3id.org/cc#amount"] +", '"+ config.wallet +"')";
      } else {
        incrementSql = "INSERT into Ledger (`source`, `amount`) values (:destination, "+credit["https://w3id.org/cc#amount"] +")";
      }
    }
    console.log(incrementSql);
    return sequelize.query(incrementSql, {replacements: { "destination" : credit["https://w3id.org/cc#destination"] }} );

  }).then(function() {
    console.log('Complete');
    //sequelize.close();
    callback(null, 'Complete');
    // hook

  }).catch(function(err){
    console.log('Failed to insert credit.', err);
    callback(err);
  });
}
