var connect = require('connect');
var serveStatic = require('serve-static');

const express = require('express');
const request = require('request');
const cors = require('cors');

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.options('*', cors());

app.get('/', (req, res) => {
  request(
    { url: 'https://supremenewyork.com' },
    (error, response, body) => {
      if (error || response.statusCode !== 200) {
        return res.status(500).json({ type: 'error', message: error.message });
      }
      res.send(body);
    }
  )
});
app.get('/mobile_stock.json', (req, res) => {
  request(
    { url: 'https://supremenewyork.com/mobile_stock.json' },
    (error, response, body) => {
      if (error || response.statusCode !== 200) {
        return res.status(500).json({ type: 'error', message: error.message });
      }
      res.send(body);
    }
  )
});
app.get('/shop/:jsonfilename', (req, res) => {
  let jsonName = req.params.jsonfilename;
  request(
    { url: 'https://supremenewyork.com/shop/'+jsonName },
    (error, response, body) => {
      if (error || response.statusCode !== 200) {
        return res.status(500).json({ type: 'error', message: error.message });
      }
      res.send(body);
    }
  )
});
app.post('/shop/:itemId/add.json', (req, res) => {
  let item = req.params.itemId;
  request(
    { url: 'https://supremenewyork.com/shop/'+item+'add.json'},
    (error, response, body) => {
      if (error || response.statusCode !== 200) {
        return res.status(500).json({ type: 'error', message: error.message });
      }
      res.send(body);
    }
  )
});

const PORT = process.env.PORT || 8050;
app.listen(PORT, () => console.log(`listening on ${PORT}`));

connect()
    .use(serveStatic('../frontend'))
    .listen(8000, () => console.log('Server running on 8000...'));