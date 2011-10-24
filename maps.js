/**
 * Created by JetBrains WebStorm.
 * User: christopherreich
 * Date: 10/23/11
 * Time: 4:39 PM
 * To change this template use File | Settings | File Templates.
 */
var cradle = require('cradle');
var conn = new (cradle.Connection)();
var db = conn.database('tweets');
db.save('_design/tweets', {
        all: {
            map: function (doc) {
                if (doc.content) emit(doc.content, doc);
            }
        },
        getRetweets: {
            map: function(doc) {
                if (doc.retweets) emit(doc.tweet_id, doc.retweets);
            }
        },
        getMoreRetweets: {
            map: function(doc) {
                if (doc.retweet_count > 0 && !doc.retweets) emit(doc.tweet_id, doc.retweets);
            }
        },
        getNewsPaper: {
            map: function(doc) {
                emit([doc.name, doc.tweet_id], doc);
            }
        }
});
