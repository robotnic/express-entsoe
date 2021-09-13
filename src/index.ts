import express from 'express';
import { Entsoe } from './Entsoe';
import cors from 'cors';
import path from 'path';
var app = express()

app.use(cors({
  origin: '*'
}))

const PORT = 8000;

app.use(express.static('public'))
/*
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/index.html'));
});
*/

app.use(Entsoe.init({
  securityToken:'68aa46a3-3b1b-4071-ac6b-4372830b114f'
}))

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});