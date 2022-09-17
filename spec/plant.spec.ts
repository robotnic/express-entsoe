import * as request from 'supertest';
import express from "express";
import { Entsoe } from "../lib/Entsoe"
import { Country } from '../lib/interfaces/countries';

describe('Per Plant', () => {
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

  it('Austria Power per plant 2022-08-26', done => {
    request.default(app)
      .get('/entsoe/10YAT-APG------L/generation_per_plant?year=2020&month=4&day=9')
      .set('refresh', 'true')
      .timeout(timeout)
      .expect(200)
      .then(response => {
        const body = response.body;
        expect(body.chartName).toBe('Generated Electricity per Power Plant')
        expect(body.unit).toBe('MW')
        expect(body.dataset.length).toBe(24)
        expect(body.dataset[0].data.length).toBe(24)
        expect(body.requestInterval.start).toBe('2020-04-08T00:00:00.000Z');
        expect(body.requestInterval.end).toBe('2020-04-09T00:00:00.000Z');
        const startTime = new Date(body.dataInterval.start).getTime();
        const endTime = new Date(body.dataInterval.end).getTime();
        expect(startTime).toBeLessThanOrEqual((new Date('2020-04-08T00:00Z').getTime()));
        expect(endTime).toBeGreaterThanOrEqual((new Date('2020-04-09T00:00Z')).getTime() - 3600000)
        expect(body.sources[0].url).toBe('https://transparency.entsoe.eu/api?documentType=A73&processType=A16&in_Domain=10YAT-APG------L&periodStart=202004080000&periodEnd=202004090000&securityToken=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX');
        done();
      })
  })


})