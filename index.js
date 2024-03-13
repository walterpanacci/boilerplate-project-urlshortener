require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('node:dns');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const { Schema } = mongoose;
const shortUrlSchema = new Schema({
  name: String,
  short: Number
});

let ShortUrl = mongoose.model('ShortUrl', shortUrlSchema);



// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

app.use(bodyParser.urlencoded({extended: false}));

app.post("/api/shorturl", async function(req, res){
  dns.lookup(req.body.url.slice(8), function(err, address){
    console.log(address);
    if(err) {
      res.json({"error": "Invalid Hostname"})
      return;
    }});
    const [x] = await ShortUrl.find({name: req.body.url});
    if(!x) {
      let index = Math.round(Math.random() * 100) + 4;
    ShortUrl.create({
      name: req.body.url,
      short: index,
    });
  res.json({
    name: req.body.url,
    short: index,
  })}
    else res.json({name: x.name, short: x.index});
    
  });

app.get("/api/shorturl/:id", async function(req, res) {
  const id = req.params.id;
  const [x] = await ShortUrl.find({short: id});
  if(!x) res.json({"error":"No short URL found for the given input"});
  else {console.log(x.name);
    res.redirect(x.name);
  }

})
