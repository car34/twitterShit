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
//--------newspaper info------------------------


//--------Initialize CouchDB-Cradle-----------------------
var cradle = require('cradle'),
    sys = require('sys');

var async = require('async');

var conn = new (cradle.Connection)();
var db = conn.database('tweets');
db.create();
sys.puts('Database Created');



//-------OAuth----------------------------------
var app = express.createServer();

var _twitterConsumerKey = "q3SYGIulMaacHiHf23Xng";
var _twitterConsumerSecret = "oFWJmn2E2S6EtFIyPtieHKnQZbiNhvo6c9IKWDt74";

var token;
var secret;
var verifier;

consumer = new oauth.OAuth(
    "https://twitter.com/oauth/request_token",
    "https://twitter.com/oauth/access_token",
    _twitterConsumerKey,
    _twitterConsumerSecret,
    "1.0A",
    "http://127.0.0.1:4000/sessions/callback",
    "HMAC-SHA1");

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

app.get('/', function(req, res) {
    res.send('Hello World');
});

app.get('/sessions/connect', function(req, res) {
    consumer.getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results) {
        if (error) {
            res.send("Error getting OAuth request token : " + sys.inspect(error), 500);
        } else {
            req.session.oauthRequestToken = oauthToken;
            req.session.oauthRequestTokenSecret = oauthTokenSecret;
            res.redirect("https://twitter.com/oauth/authorize?oauth_token=" + req.session.oauthRequestToken);
        }
    });
});

//-------------------Requesting Data From Twitter--------------------------

app.get('/sessions/callback', function(req, res) {
    token = req.session.oauthRequestToken;
    secret = req.session.oauthRequestTokenSecret;
    verifier = req.query.oauth_verifier;
    consumer.getOAuthAccessToken(req.session.oauthRequestToken, req.session.oauthRequestTokenSecret, req.query.oauth_verifier, function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
        if (error) {
            res.send("Error getting OAuth access token : " + sys.inspect(error) + "[" + oauthAccessToken + "]" + "[" + oauthAccessTokenSecret + "]" + "[" + sys.inspect(results) + "]", 500);
        } else {
            token = oauthAccessToken;
            secret = oauthAccessTokenSecret;
            res.redirect('/retweets');
        }
        });
    });
app.get('/retweets', function(req, res) {
    db.view('tweets/all', function (err, docs) {

                    if (err) {
                        console.log(err);
                    }
                    else {
                        docs.map(tweetQuery);
                    }
                    //Need to grab oldest ID in DB in order to start requesting from there
            });
});

    function tweetQuery(doc) {
        console.log(doc);
        var tweetID = doc.tweet_id;
        var retweets = [];
        consumer.get("http://api.twitter.com/1/statuses/retweets/" + tweetID + ".json?include_entities=true&trim_user=0", token, secret, function (error, data, response) {
            if (error) {
                console.log("Error getting tweet : " + sys.inspect(error), 500);
                return;
            }
            else {
                var parsedData = JSON.parse(data);
                for (var x = 0; x < parsedData.length; x++) {
                    var twt = parsedData[x];
                    console.log(twt);
                    var retweet = 1;
                    var name = twt.user.name;
                    var description = twt.user.description;
                    var followers_count = twt.user.followers_count;
                    var location = twt.user.location;

                    var content = twt.text;
                    var time = twt.created_at;
                    var id = tweetID;
                    var retweet = twt.retweet_count;
                    var hashtag = twt.entities.hashtags;
                    var user_mentions = twt.entities.user_mentions;


                    retweets.push({
                                name: name,
                                description: description,
                                location: location,
                                followers_count: followers_count,
                                content: content,
                                time: time,
                                tweet_id: id,
                                retweet_count: retweet,
                                hashtags: hashtag,
                                user_mentions: user_mentions
                            });


                }
            }

            db.merge(
                        doc._id,
                        {
                            retweets: retweets
                        }
                    ,
                        function (err, res) {
                            if (err) {
                                sys.puts(err);
                            } else {
                                console.log("ADDED " + doc._id);
                            }
                        }

                    );
        });
    }

    app.listen(4000);