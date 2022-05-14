import * as request from 'supertest';
import express from "express";
import { Entsoe } from "../lib/Entsoe"
import { Country } from '../lib/interfaces/countries';




describe('Electricity consumption', () => {
  const timeout = 120000;

  beforeEach(function () {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
  });

  const app = express();
  if (process.env.securityToken) {
    app.use(Entsoe.init({
      securityToken: process.env.securityToken,
      awsBucket: process.env.awsBucket,
      awsSecretAccessKey: process.env.awsSecretAccessKey,
      awsAccessKeyId: process.env.awsAccessKeyId,
      awsRegion: process.env.awsRegion,
      cacheDir: process.env.cacheDir
    }));
  } else {
    console.log('process.env.securityToken missing')
  }
  it('Electricity Consumption Week Germany', done => {
    request.default(app)
      .get('/entsoe/10Y1001A1001A83F/load?year=2019&week=19')
      .set('refresh', 'true')
      .timeout(timeout)
      .expect(200)
      .then(response => {
        const body = response.body;
        console.log(body);
        expect(body.chartName).toBe('Electricity Consumption')
        expect(body.unit).toBe('MW')
        expect(body.dataset.length).toBe(1)
        expect(body.dataset[0].data.length).toBe(672)
        expect(body.requestInterval.start).toBe('2019-05-05T00:00:00.000Z')
        expect(body.requestInterval.end).toBe('2019-05-12T00:00:00.000Z');
        expect(body.sources[0].url).toBe('https://transparency.entsoe.eu/api?documentType=A65&processType=A16&outBiddingZone_Domain=10Y1001A1001A83F&periodStart=201905050000&periodEnd=201905120000&securityToken=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX');
        done();
      })
  })

})