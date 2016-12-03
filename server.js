var express = require('express');
var validUrl = require('valid-url');
var mongodb = require('mongodb');

var counter = 0;
var app = express()


var port = process.env.PORT || 8080;





app.get('/new/*', function(req, res) {
  var url = req.originalUrl.substr(5)

  if( !validUrl.is_http_uri(url) ) {
    res.send({'Error': 'Please enter a valid URL.'})
  }
  var MongoClient = mongodb.MongoClient;

  var mongoUrl = process.env.MONGOLAB_URI;

  MongoClient.connect(mongoUrl, function (err, db) {
    if (err) {
      console.log('Unable to connect to the Server', err);
    } else {
      console.log('Connected to server');
      var collection = db.collection('urls');

      function countDocs(collection, callback) {
      collection.count(function(err, count) {
          if (err) return callback(err, null)
          callback(null, count)
          db.close();
        });
      }

      function insertDoc(err, count) {
        if(err) {
          console.log(err);
        } else {
        collection.insert({url: url, code: count}, function (err, result) {
        if(err) {
          console.log(err);
        } else {
          res.send({'original-url': url, 'shortened-url': 'http://www.xxx.com/' + count});
        }
      })
        db.close();
      }
      }
      countDocs(collection, insertDoc)
    }
  })
})

app.get('/*', function(req, res) {
  var url = req.originalUrl.substr(1)
  var MongoClient = mongodb.MongoClient;

  var mongoUrl = process.env.MONGOLAB_URI;

  MongoClient.connect(mongoUrl, function (err, db) {
    if (err) {
      console.log('Unable to connect to the Server', err);
    } else {
      console.log('Connected to server');
      var collection = db.collection('urls');
      collection.findOne({code: parseInt(url)}, function (err, documents) {
        if(err) {
          console.log(err);
        } else if(!documents){
          res.send({'Error': 'Please enter valid URL shortcode.'})
        } else {
          res.redirect(documents.url);
        }
      })
    }
  })
})

app.listen(port, function () {
  console.log('Example app listening on port ' + port)
})
