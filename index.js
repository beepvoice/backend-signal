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

app.get('/subscribe', (req, res) => {
  if (!req.get("X-User-Claim")) {
    res.sendStatus(401);
    return;
  }

  try {
    const user_claim = JSON.parse(req.get("X-User-Claim"));
    if (!connections[user_claim.userid]) {
      connections[user_claim.userid] = {};
    }

    console.log(`Someone subscribed to ${user_claim.userid}, ${user_claim.clientid}`);

    connections[user_claim.userid][user_claim.clientid] = res;
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
      connections[user_claim.userid][user_claim.clientid] = null;
      clearTimeout(timeoutID);
    });
  } catch(e) {
    res.sendStatus(401)
  }
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
  } else {
    try {
      const user_claim = JSON.parse(req.get("X-User-Claim"));
      if(!(user_claim.userid && user_claim.clientid)) {
        res.sendStatus(401);
      } else {
        console.log('Posting:');
        req.body.id = `${user_claim.userid}:${user_claim.clientid}`
        console.log(`id: ${req.body.id}\nevent: ${req.body.event}\ndata: ${encodeURI(req.body.data)}\n\n`);
        console.log(`To ${req.params.user}, ${req.params.device}`);
        connections[req.params.user][req.params.device].write(`id: ${req.body.id}\nevent: ${req.body.event}\ndata: ${encodeURI(req.body.data)}\n\n`);
        res.sendStatus(200);
      }
    } catch(e) {
      res.sendStatus(401);
    }
  }
});

app.listen(process.env.PORT, (err) => {
  err ? console.error(err) : console.log(`Listening on port ${process.env.PORT}`);
});
