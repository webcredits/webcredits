[![Stories in Ready](https://badge.waffle.io/webcredits/webcredits.png?label=ready&title=Ready)](https://waffle.io/webcredits/webcredits)

webcredits
==========

Webcredits is a library for creating decentralized ledgers and payments on the
web.

# Installation

    npm install -g webcredits

Or install via github clone

# Config

While web credits will often work out of the box, in the config directory to change settings.  See below.

# Pre requisites

Webcredits requires a database.  While sqlite can be used via the config, it is recommended to use a mysql database, the defualt user is set to 'me'

# Example Setup

    credit create  # will create the tables in the DB
    credit genesis # will seed the ledger with 1 million bits in the coinbase

After the tables are in place, the genesis process must be carried out.  The standard population script will put 1 million bits in the coinbase which can then be distributed in tranches to the seed users or robots.

# Interacting with Webcredits -- HTTP

    credit server --key <key> --cert <cert>

##### How do I get the --key and the --cert?

You need an SSL certificate you get this from your domain provider or for free from [Let's Encrypt!](https://letsencrypt.org/getting-started/).

If you don't have one yet, or you just want to test `webcredits`, generate a certificate:
```
$ openssl genrsa 2048 > ../localhost.key
$ openssl req -new -x509 -nodes -sha256 -days 3650 -key ../localhost.key -subj '/CN=*.localhost' > ../localhost.cert
```

Then go to

* <https://localhost:11077/>

Provides a list of ledgers

* <https://localhost:11077/ledger>

Shows values in a ledger

* <https://localhost:11077/balance>

Requires a source variable and gives an individual balance

* <https://localhost:11077/reputation>

Requires a source variable and gives a reputation score

* <https://localhost:11077/today>

Requires a source variable and gives the credits for a given day

* <https://localhost:11077/tx>

Requires a source variable and gives a reputation score for that user

* <https://localhost:11077/insert>

Inserts via POST, required are source, destination and amount

The source is authenticated via WebID TLS


# Interacting with Webcredits -- command line

Alternatively calls can be placed via the library or command line.

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

# More Detailed Explanation

Webcredits is a transferable points scoring system.  It can be used to provide feedback to the user, throttle actions and allow "gamification" of apps.  The system is secure and compatible with the work of the W3C payments groups, so that real incentives may be eventually used.  The first versions of the system will only use test credits of negligible monetary value.  However, the same code can be used for production systems using full payments.

# Technical Overview

A wallet consists of a ledger and transactions.  Each entry in the ledger is a URI and a positive balance.  

    <URI> "balance"^^xsd:decimal <currency>

Changes are made to the ledger via webcredits.  

    <source> <amount> <currency> <destination> [comment] [context] [timestamp]

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

# API

## Functions

<dl>
<dt><a href="#setupDB">setupDB(dialect, storage)</a> ⇒ <code>Object</code></dt>
<dd><p>setup database</p>
</dd>
<dt><a href="#getConfig">getConfig()</a> ⇒ <code>Object</code></dt>
<dd><p>gets the current config</p>
</dd>
<dt><a href="#createTables">createTables(sequelize, callback)</a></dt>
<dd><p>create tables</p>
</dd>
<dt><a href="#getCredit">getCredit(credit, sequelize, config, callback)</a> ⇒ <code>Object</code></dt>
<dd><p>get credit</p>
</dd>
<dt><a href="#createDB">createDB(config, callback)</a></dt>
<dd><p>createDB function</p>
</dd>
<dt><a href="#getBalance">getBalance(source, sequelize, config, callback)</a></dt>
<dd><p>get balance</p>
</dd>
<dt><a href="#genesisInit">genesisInit(config, callback)</a></dt>
<dd><p>genesis initialization</p>
</dd>
<dt><a href="#genesis">genesis(config, callback)</a></dt>
<dd><p>genesis</p>
</dd>
<dt><a href="#balance">balance(source, sequelize, config, callback)</a></dt>
<dd><p>get balance</p>
</dd>
<dt><a href="#getReputation">getReputation(sequelize)</a></dt>
<dd><p>get reputation</p>
</dd>
<dt><a href="#today">today(credit, sequelize, config, callback)</a></dt>
<dd><p>Today&#39;s credits</p>
</dd>
<dt><a href="#reputation">reputation(config)</a></dt>
<dd><p>reputation function</p>
</dd>
<dt><a href="#insert">insert(credit, sequelize, config, callback)</a></dt>
<dd><p>Insert into webcredits</p>
</dd>
</dl>

<a name="setupDB"></a>
## setupDB(dialect, storage) ⇒ <code>Object</code>
setup database

**Kind**: global function  
**Returns**: <code>Object</code> - sequelize db object  

| Param | Type | Description |
| --- | --- | --- |
| dialect | <code>string</code> | type of db mysql|sqlite |
| storage | <code>string</code> | file used for sqlite, default ./credit.db |

<a name="getConfig"></a>
## getConfig() ⇒ <code>Object</code>
gets the current config

**Kind**: global function  
**Returns**: <code>Object</code> - The config  
<a name="createTables"></a>
## createTables(sequelize, callback)
create tables

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| sequelize | <code>Object</code> | db object |
| callback | <code>Object</code> | callback |

<a name="getCredit"></a>
## getCredit(credit, sequelize, config, callback) ⇒ <code>Object</code>
get credit

**Kind**: global function  
**Returns**: <code>Object</code> - the web credit if exists  

| Param | Type | Description |
| --- | --- | --- |
| credit | <code>Object</code> | the web credit |
| sequelize | <code>Object</code> | the DB connection |
| config | <code>Object</code> | the config |
| callback | <code>Object</code> | callback |

<a name="createDB"></a>
## createDB(config, callback)
createDB function

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | config |
| callback | <code>Object</code> | callback |

<a name="getBalance"></a>
## getBalance(source, sequelize, config, callback)
get balance

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| source | <code>String</code> | the source |
| sequelize | <code>Object</code> | sequelize object |
| config | <code>Object</code> | config |
| callback | <code>function</code> | callback |

<a name="genesisInit"></a>
## genesisInit(config, callback)
genesis initialization

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | config |
| callback | <code>function</code> | callback |

<a name="genesis"></a>
## genesis(config, callback)
genesis

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | config |
| callback | <code>function</code> | callback |

<a name="balance"></a>
## balance(source, sequelize, config, callback)
get balance

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| source | <code>String</code> | the source |
| sequelize | <code>Object</code> | sequelize object |
| config | <code>Object</code> | config |
| callback | <code>function</code> | callback |

<a name="getReputation"></a>
## getReputation(sequelize)
get reputation

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| sequelize | <code>Object</code> | db object |

<a name="today"></a>
## today(credit, sequelize, config, callback)
Today's credits

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| credit | <code>Object</code> | a web credit |
| sequelize | <code>Object</code> | db connection |
| config | <code>Object</code> | config |
| callback | <code>function</code> | callback |

<a name="reputation"></a>
## reputation(config)
reputation function

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | [description] |

<a name="insert"></a>
## insert(credit, sequelize, config, callback)
Insert into webcredits

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| credit | <code>Object</code> | a web credit |
| sequelize | <code>Object</code> | db connection |
| config | <code>Object</code> | config |
| callback | <code>function</code> | callback |
