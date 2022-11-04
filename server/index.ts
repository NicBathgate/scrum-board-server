require("dotenv").config();
const express = require('express');
const jwt = require ('jsonwebtoken');
import * as bodyParser from "body-parser";
import * as cors from "cors";

const app = express();
const SECRET = 'topsecretkey';
const USER = { username: 'TP', password: 'alexlovestypescript' };
app.use(cors({ origin: [ "http://localhost:3000", "http://localhost:3001" ] }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/api/login', (req, res) => {
  if(req.body.username === USER.username && req.body.password === USER.password) {
    jwt.sign({ USER }, SECRET, (err, token) => {
      res.json({token});
    });
  } else {
    res.sendStatus(401);
  }
});

const api = require("./api");
app.use("/api", isAuthenticated, api);

app.listen(8080, () => console.log("Listening on port 8080"));


function isAuthenticated(req, res, next) {
  const bearerToken = typeof req.headers['authorization'] !== "undefined" ?
    req.headers['authorization'].split(' ')[1]
    :
    res.sendStatus(401); // Forbidden
  jwt.verify(bearerToken, SECRET, (err) => {
    if(err) res.sendStatus(401);
    else next();
  });
}
