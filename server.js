var webPush = require('web-push');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

webPush.setGCMAPIKey(process.env.GCM_API_KEY);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(bodyParser.json());

app.post('/register', function(req, res) {
  res.sendStatus(201);
});

app.post('/sendNotification', function(req, res) {
  setTimeout(function() {
    webPush.sendNotification(req.body.endpoint, {
      TTL: req.body.ttl,
      payload: req.body.payload,
      userPublicKey: req.body.key,
      userAuth: req.body.authSecret,
    })
    .then(function() {
      res.sendStatus(201);
    });
  }, req.body.delay * 1000);
});




app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
