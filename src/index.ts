import express from 'express';
import { Entsoe } from './Entsoe';
import cors from 'cors';
var app = express()

app.use(cors({
  origin: '*'
}))

const PORT = 8000;

//const loader = new Loader();

app.get('/', (req, res) => res.send('Express + TypeScript Server'));

app.use(Entsoe.init({
  securityToken:'68aa46a3-3b1b-4071-ac6b-4372830b114f'
}))
/*
app.get('/chart/:country/installed', async (req, res) => {
  const country = req.params.country;
  console.log(country);
  try {
    const data = await loader.loadInstalled(country, req.query);
    res.set('Cache-Control', 'public, max-age=31536000');
    res.send(data);
  } catch (e: any) {
    if (e instanceof InputError) {
      res.status(e.status).send(e.message);
    } else {
      console.trace(e);
      res.status(500).send('error');
    }
  }
})

app.get('/chart/:country/:type', async (req, res) => {
  //  const country = '10YAT-APG------L';
  const country = req.params.country;
  const type = req.params.type;
  let periodStart = '201610302300';
  let periodEnd = '201612312300';
  let psrType;
  if (req.query.year) {
    if (typeof (req.query.year) === 'string') {
      const start = startOfYear(new Date(req.query.year));
      const end = endOfYear(new Date(req.query.year));
      periodStart = format(start, 'yyyy0101HHmm');
      periodEnd = format(end, 'yyyy09010000');
      periodStart = req.query.year + '01010000'
      periodEnd = req.query.year + '02010000'
      if (req.query.psrType && typeof (req.query.psrType) === 'string') {
        psrType = req.query.psrType;
      }
    }

  }

  const data = await loader.getEntsoeData(country, type, periodStart, periodEnd, psrType);
  // data.title = data.title + ' ' + req.query.year;
  res.set('Cache-Control', 'public, max-age=31536000');
  res.send(data);
})
*/
app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});