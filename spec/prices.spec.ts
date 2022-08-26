import * as request from 'supertest';
import express from "express";
import { Entsoe } from "../lib/Entsoe"
import { Country } from '../lib/interfaces/countries';




describe('Electricity Generation', () => {
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
  it('Price Day Austria', done => {
    request.default(app)
      .get('/entsoe/10YAT-APG------L/prices?year=2021&month=3&day=11')
      .set('refresh', 'true')
      .timeout(timeout)
      .expect(200)
      .then(response => {
        const body = response.body;
        expect(body.chartName).toBe('Day Ahead Prices')
        expect(body.unit).toBe('€/MW')
        expect(body.dataset.length).toBe(1)
        expect(body.dataset[0].data.length).toBe(48)
        expect(body.dataset[0].label).toBe('Price')
        expect(body.dataset[0].psrType).toBe('X99')
        expect(body.requestInterval.start).toBe('2021-03-11T00:00:00.000Z')
        expect(body.requestInterval.end).toBe('2021-03-12T00:00:00.000Z');
        expect(body.sources[0].url).toBe('https://transparency.entsoe.eu/api?documentType=A44&in_Domain=10YAT-APG------L&out_Domain=10YAT-APG------L&periodStart=202103110000&periodEnd=202103120000&securityToken=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX');
        done();
      })
  })

})