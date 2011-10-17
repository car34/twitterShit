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
var cradle = require('cradle')
//--------newspaper info------------------------
var   paperName = 'charlotteobserver';
var twitterUser = 'theobserver';
var   twitterID = 8695932;

//--------Initialize CouchDB-Cradle-----------------------
var cradle = require('cradle'),
       sys = require('sys');
 
var conn = new(cradle.Connection)();
var db = conn.database('test');
db.create();
sys.puts('Database Created');



//-------OAuth----------------------------------
var app = express.createServer();

var _twitterConsumerKey = "q3SYGIulMaacHiHf23Xng";
var _twitterConsumerSecret = "oFWJmn2E2S6EtFIyPtieHKnQZbiNhvo6c9IKWDt74";

consumer = new oauth.OAuth(
        "https://twitter.com/oauth/request_token",
        "https://twitter.com/oauth/access_token",
        _twitterConsumerKey,
        _twitterConsumerSecret,
        "1.0A",
        "http://127.0.0.1:4000/sessions/callback",
        "HMAC-SHA1");

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'keyboard cat', maxAge: 3600000}));
});

app.dynamicHelpers({
  session: function(req, res){
    return req.session;
  }
});

app.get('/', function(req, res){
  res.send('Hello World');
});

app.get('/sessions/connect', function(req, res){
  consumer.getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results){
    if (error) {
      res.send("Error getting OAuth request token : " + sys.inspect(error), 500);
    } else {
      req.session.oauthRequestToken = oauthToken;
      req.session.oauthRequestTokenSecret = oauthTokenSecret;
      res.redirect("https://twitter.com/oauth/authorize?oauth_token="+req.session.oauthRequestToken);
    }
  });
});

//-------------------Requesting Data From Twitter--------------------------
app.get('/sessions/callback', function(req, res){
  sys.puts(">>"+req.session.oauthRequestToken);
  sys.puts(">>"+req.session.oauthRequestTokenSecret);
  sys.puts(">>"+req.query.oauth_verifier);
  consumer.getOAuthAccessToken(req.session.oauthRequestToken, req.session.oauthRequestTokenSecret, req.query.oauth_verifier, function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
    if (error) {
      res.send("Error getting OAuth access token : " + sys.inspect(error) + "["+oauthAccessToken+"]"+ "["+oauthAccessTokenSecret+"]"+ "["+sys.inspect(results)+"]", 500);
    } else {
      req.session.oauthAccessToken = oauthAccessToken;
      req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;

      //Need to grab oldest ID in DB in order to start requesting from there
      lastTweetID = 124844694537633800;

      consumer.get("http://api.twitter.com/1/statuses/user_timeline.json?max_id=" + lastTweetID + "&include_entities=true&user_id=8695932", req.session.oauthAccessToken, req.session.oauthAccessTokenSecret, function (error, data, response) {
      if (error) {
          res.send("Error getting twitter screen name : " + sys.inspect(error), 500);
      }
      else {
          var parsedData = JSON.parse(data);
          sys.inspect(parsedData);
          req.session.twitterScreenName = parsedData["name"];
          res.send('You are signed in: ' + req.session.twitterScreenName);

            db.save([{name: req.session.twitterScreenName, }], function (err, res) {
            sys.puts(res);

            });
        }
      });
    }
  });
});

app.listen(4000);


