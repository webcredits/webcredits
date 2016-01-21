[![Stories in Ready](https://badge.waffle.io/webcredits/webcredits.png?label=ready&title=Ready)](https://waffle.io/webcredits/webcredits)

webcredits
==========

# Installation

    npm install -g webcredits

# Commands

    balance <URI>                - shows a balance
    create                       - creates a database
    genesis                      - seeds a wallet
    help                         - shows help message
    insert <source> <amount> <unit> <destination>
       [description] [timestamp] - inserts a web credit
    reputation <URI>             - gets the reputation
    server                       - starts an express server
    websocket                    - starts a websocket server

# Setup

    credit create
    credit genesis

Will conform to the values in lib/dbconfig.js

# Configuration

    config.dialect  = 'mysql';
    config.storage  = 'credit.db';
    config.host     = 'localhost';
    config.database = 'webcredits';
    config.username = 'root';
    config.password = '';
    config.wallet   = 'https://localhost/wallet/test#this';

`dialect` is the db type
* mysql
* sqlite
* mssql
* mariadb
* postgres

`storage` is for sqlite defaults to `credit.db`

* `host` is host
* `database` is database name
* `username` is username
* `password` is password
* `wallet` is the wallet that contains the webcredit ledger, api and details

Are supported

# Introduction

Webcredits is a transferable points scoring system.  It can be used to provide feedback to the user, throttle actions and allow "gamification" of apps.  The system is secure and compatible with the work of the W3C payments groups, so that real incentives may be eventually used.  The first versions of the system will only use test credits of negligible monetary value.  However, the same code can be used for production systems using full payments.

# Technical Overview

A wallet consists of a ledger and transactions.  Each entry in the ledger is a URI and a positive balance.  

    <URI> "balance"^^xsd:decimal <currency>

Changes are made to the ledger via webcredits.  

    <source> <amount> <currency> <destination> <comment> <timestamp>

The genesis state is a starting ledger where one balance, usually the "coinbase" is a non zero account with an emission algorithm.  Digital signatures may be included with the webcredits to prove who sent them.

The ledgers and credits can be stored in an LDPC or database.  Changes to the ledger are made by adding new transactions, either via HTTP POST or by a direct insert to the database.

# Model

## Ontology

The main ontology is the webcredits system

* https://w3id.org/cc

## Discovery

Wallets can be found either from a WebID or from an application configuration using the wallet predicate.  

    https://w3id.org/cc#wallet

This allows users to launch a wallet app and see their balance, their transaction history, and to make new payments.

## Wallet

The wallet is the main holding structure that points to all the other items.  A typical wallet may look as follows:

```
<#this>
    <http://purl.org/dc/terms/description> "My Wallet" ;
    a <https://w3id.org/cc#Wallet> ;
    <https://w3id.org/cc#api> <http://klaranet/wallet/var/api/v1/> ;
    <https://w3id.org/cc#inbox> <inbox/> ;
    <https://w3id.org/cc#tx> <tx/> .

```

* The api is where you can make RESTful calls for balances and transactions
* The inbox is where you can POST new credits
* The tx is where processed transactions are (optionally) stored

## Databases

For large scale processing a database can be used.  Initially supported databases are:

* sqlite
* mySql

Example schemas

```sql
CREATE TABLE Credit (
  `@id` TEXT,
  `source` TEXT,
  `amount` REAL,
  `currency` VARCHAR(255) DEFAULT 'https://w3id.org/cc#bit',
  `destination` TEXT,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `context` TEXT,
  `description` TEXT,
  `wallet` TEXT
);

CREATE TABLE Ledger (
  `source` TEXT,
  `amount` REAL,
  `currency` VARCHAR(255) DEFAULT 'https://w3id.org/cc#bit',
  `wallet` TEXT
);

CREATE TABLE Genesis (
  `source` TEXT,
  `amount` REAL,
  `currency` VARCHAR(255) DEFAULT 'https://w3id.org/cc#bit',
  `wallet` TEXT
);

```
The default currency is the 'bit' equal to one millionth of a bitcoin.

# Controller

## Setup

The first step is to setup the database structure in a file (sqlite) or in a mysql database.

After the tables are in place, the genesis process must be carried out.  The standard population script will put 1 million bits in the coinbase which can then be distributed in tranches to the seed users or robots.

## Reading

It is possible to access balances and credits directly from the database.

A RESTful API is also provided for convenience to the database.

## Writing

It is possible to write records to the database, tho this is not recommended.  Better is to use the javascript API.


## JavaScript API

The javascript API provides a function insert.js that will
* insert a credit into the data store
* get a canonical ID for a data structure
* check no balance goes below zero
* alter the ledger of the source and destination

```
    insert.js <source> <amount> <currency> <destination> [comment] [timestamp] [wallet]
```

# Views

## Virtual Wallet

The first client used is an open source client side JS project called virtual wallet:

* https://virtualwallet.org/
