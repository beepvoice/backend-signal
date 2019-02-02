require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

let app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  next();
});

let connections = {};

app.get('/subscribe/:user/device/:device', (req, res) => {
  if (!connections[req.params.user]) {
    connections[req.params.user] = {};
  }

  connections[req.params.user][req.params.device] = res;
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache'
  });

  // So the connection doesn't timeout and die
  let timeoutID = 0;
  const refresh = () => {
    res.write(':\n\n');
    timeoutID = setTimeout(refresh, 25000);
  };
  refresh();

  res.on('close', () => {
    connections[req.params.user][req.params.device] = null;
    clearTimeout(timeoutID);
  });
});

app.get('/user/:user/devices', (req, res) => {
  if (!connections[req.params.user]) {
    res.status(200).json([]);
  } else {
    res.status(200).json(Object.keys(connections[req.params.user]));
  }
});

app.post('/user/:user/device/:device', (req, res) => {
  if(!connections[req.params.user]){
    res.sendStatus(404);
  } else if (!connections[req.params.user][req.params.device]){
    res.sendStatus(404);
  } else if (!req.body.data) {
    res.sendStatus(400);
  }  else {
    connections[req.params.user][req.params.device].write(`data: ${req.body.data}\n\n`);
    res.sendStatus(200);
  }
});

app.listen(process.env.PORT, (err) => {
  err ? console.error(err) : console.log(`Listening on port ${process.env.PORT}`);
});
