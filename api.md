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
