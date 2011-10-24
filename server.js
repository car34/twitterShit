/**
 * Created by JetBrains WebStorm.
 * User: charlesdolan
 * Date: 10/22/11
 * Time: 6:37 PM
 * To change this template use File | Settings | File Templates.
 */

/**
 * Module dependencies.
 */

var express = require('express');
var stylus = require('stylus');
var app = module.exports = express.createServer();

// Configuration
var publicDir = '/public';
var viewsDir = '/views';

function compile(str, path) {
    return stylus(str)
        .set('filename', path)
        .set('compress', true);
}
// add the stylus middleware, which re-compiles when
// a stylesheet has changed, compiling FROM src,
// TO dest. dest is optional, defaulting to src
app.use(stylus.middleware({
    src: __dirname + viewsDir
    , dest: __dirname + publicDir
    , compile: compile
    , firebug: true
}));
app.set('view engine', 'jade');

// the middleware itself does not serve the static
// css files, so we need to expose them with staticProvider

app.use(express.static(__dirname + publicDir));
app.use(express.bodyParser());

app.configure(function() {
    app.set('views', __dirname + '/views');

    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
    app.use(express.errorHandler());
});


//set path to the views (template) directory
//app.set('views', __dirname + '/views');
//handle GET requests on /


var cradle = require('cradle');
var conn = new (cradle.Connection)();
var db = conn.database('tweets');

app.get('/', function(req, res) {
   res.render('index');
});

app.get('/paper/:paperName', function(req, res) {
    var paperName = req.params.paperName;


    var tweets = [];

    var query = {
        startkey: [paperName, {}],
        endkey: [paperName],
        descending: true
    }
    db.view('tweets/getNewsPaper', query, function (err, tweets) {
        tweets = tweets.map(function(tweet) {
            return tweet;
        })
        console.log(tweets);
        res.render('paper', {
            title: 'Tweets',
            newspaper: paperName,
            tweets: tweets
        });
    });

});


app.listen(4000);


var paperName2 = 'test2';
var tweets2 = [];

