const http = require('http');
const https = require('https');
// const url = require('url');

const PORT = 7749;
const JANUS_SERVER = {
  host: 'www.pygeeks.com',
  port: 8089
};

const express = require('express');
const cors = require('cors');

const _raiseError = (res) => {
  res.status(403).send({
    msg: 'Access denied!!!'
  });
};

const _isValidRequest = (req, res, next) => {
  let result = true;
  const data = req.body || {};
  if (data.body && data.body.request && data.body.request === 'create') {
    result = false;
  }
  return result;
};
  
const verifyRequest = (req, res, next) => {
  if (_isValidRequest(req)) {
    next();
  } else {
    _raiseError(res);
  }
};

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());
app.use(verifyRequest);

app.all('*', (req, res) => {
  let headers = req.headers;
  headers.host = JANUS_SERVER.host;
  req.pause();
  const connector = https.request({
    host: JANUS_SERVER.host,
    port: JANUS_SERVER.port,
    path: req.url,
    method: req.method,
    headers: headers,
    agent: false
  }, (janusRes) => {
    janusRes.pause();
    res.writeHeader(janusRes.statusCode, janusRes.headers);
    janusRes.pipe(res, { end: true });
    janusRes.resume();
  });
  connector.write(JSON.stringify(req.body));
  req.pipe(connector,  { end: true });
  req.resume();
});

app.listen(PORT, () => console.log(`Server started!!!`));
