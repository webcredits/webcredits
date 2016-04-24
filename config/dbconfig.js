#!/usr/bin/env node

var config = {};
config.storage  = 'credit.db';
config.dialect  = 'mysql';
config.host     = 'localhost';
config.database = 'webcredits';
config.username = 'me';
config.password = '';
config.wallet   = 'https://localhost/wallet/test#this';
config.currency = 'https://w3id.org/cc#bit';

module.exports = config;
