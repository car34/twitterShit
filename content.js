/**
 * Created by JetBrains WebStorm.
 * User: christopherreich
 * Date: 10/14/11
 * Time: 1:22 AM
 */
//--------Modules------------------------------
var express = require('express');
var sys = require('sys');
var cradle = require('cradle')


var app = express.createServer();

app.configure('development', function() {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.use(express.logger());
    app.use(express.cookieParser());
    app.use(express.session({ secret: 'keyboard cat', maxAge: 3600000}));
});
app.dynamicHelpers({
    session: function(req, res) {
        return req.session;
    }
});


//--------Initialize CouchDB-Cradle-----------------------
var paperName = 'cabarrusnews';
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
            if (doc.content) emit(doc.content, doc);
        }
    }
});
    
db.view('tweets/all', function (err, res) {
    
    var body =    '<html>'+
                  '<head>'+
                  '<meta http-equiv="Content-Type" content="text/html; '+
                  'charset=UTF-8" />'+
                  '</head>'+
                  '<body>';
                  res.forEach(function (row) {
                  console.log(row);
                    body = body + "<div id = \'tweet\'>" + row.time + "   " + row.content + "</div>";
                  });

    body = body +
        '</body>'+
        '</html>';

  
   res.write(body);
   res.end();
});
app.listen(4000);