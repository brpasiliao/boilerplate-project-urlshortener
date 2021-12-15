require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dns = require('dns');
const URL = require("url").URL;
const app = express();

mongoose.connect(process.env['MONGO_URI'], { useNewUrlParser: true, useUnifiedTopology: true });

const { Schema } = mongoose;

const Url = mongoose.model('Url', new Schema({
  original_url: String, 
  short_url: Number
}));

Url.deleteMany({}, (err) =>  {
  if (err) console.log(err)
});

const isValidUrl = (s) => {
  try {
    new URL(s);
    return true;
  } catch (err) {
    return false;
  }
};

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended: false}));

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

let counter = 0;
app.post("/api/shorturl", (req, res) => {
  if (!isValidUrl(req.body.url)) {
    console.log(req.body.url);
    res.send({ error: 'invalid url' });
  } else {
    let newUrl = new Url({
      original_url: req.body.url, 
      short_url: counter++
    });

    newUrl.save();

    res.send({ original_url: newUrl.original_url, short_url: newUrl.short_url });
  }
});

app.get('/api/shorturl/:shortUrl', (req, res) => {
  Url.findOne({ short_url: req.params.shortUrl }, (err, url) => {
    if (err) return console.log(err);
    res.redirect(url.original_url);
  })
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
