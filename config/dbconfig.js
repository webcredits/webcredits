#!/usr/bin/env node

var config = {};
config.storage  = 'credit.db';
config.dialect  = 'mysql';
config.host     = 'localhost';
config.database = 'webcredits';
config.username = 'root';
config.password = '';
config.wallet   = 'https://localhost/wallet/inartes#this';

module.exports = config;
