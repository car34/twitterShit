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

//--------Initialize CouchDB-Cradle-----------------------
var newsPaper = 'cabarrusnews';
var cradle = require('cradle'),
    sys = require('sys');

var async = require('async');

var conn = new (cradle.Connection)();
var db = conn.database(paperName);
db.create();
sys.puts('Database Created');


app.get('/', function(req, res) {
    var body =    '<html>'+
        '<head>'+
        '<meta http-equiv="Content-Type" content="text/html; '+
        'charset=UTF-8" />'+
        '</head>'+
        '<body>';
    db.view(newsPaper + '/all', function (err, res) {
        res.forEach(function (row) {
            body = body + "<div id = 'tweet'>" + row.time + "   " + row.content + ""</div>";
        });
    });




    body = body + '</form>'+
        '</body>'+
        '</html>';

    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(body);
    response.end();


});
app.listen(4000);