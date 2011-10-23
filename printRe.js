/**
 * Created by JetBrains WebStorm.
 * User: christopherreich
 * Date: 10/23/11
 * Time: 11:58 AM
 * To change this template use File | Settings | File Templates.
 */
/**
 * Created by JetBrains WebStorm.
 * User: christopherreich
 * Date: 10/14/11
 * Time: 1:22 AM
 */
//--------Modules------------------------------
var express = require('express');
var sys = require('sys');
var oauth = require('oauth');
var cradle = require('cradle');
var app = express.createServer();
//--------newspaper info------------------------
var paperName = 'cabarrusnews';

//--------Initialize CouchDB-Cradle-----------------------
var cradle = require('cradle'),
    sys = require('sys');

var async = require('async');

var conn = new (cradle.Connection)();
var db = conn.database(paperName);
db.create();
sys.puts('Database Created');

db.save('_design/tweets', {
    all: {
        map: function (doc) {
            if (doc.retweets[0]) emit(doc.tweet_id, doc);
        }
    }
});


app.get('/', function(req, res) {
    res.send('Hello World');
});


//-------------------Requesting Data From Twitter--------------------------

app.get('/retweets', function(req, res) {
    db.view('tweets/all', function (err, docs) {
        if (err) {
            console.log(err);
        }
        else {
            docs.forEach(function(row) {
                console.log(row)

                });
        }
    });
});


app.listen(4000);