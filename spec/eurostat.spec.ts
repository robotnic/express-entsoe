import * as request from 'supertest';
import express from "express";
import { Entsoe } from "../lib/Entsoe"




describe('Eurostat fossil', () => {
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

  it('Benzin, Diesel, Gas, Flugbenzin ', done => {
    request.default(app)
      .get('/entsoe/fossil?country=AT&year=2020')
      .set('refresh', 'true')
      .timeout(timeout)
      .expect(200)
      .then(response => {
        const body = response.body;
        body.labels.forEach((label: any) => {
          expect(typeof(label)).toBe('string')
        });
        expect(body.datasets.length).toBe(4)

        body.datasets.forEach((dataset: any) => {
          expect(typeof (dataset.label)).toBe('string')
          expect(typeof (dataset.backgroundColor)).toBe('string')
        })


        done();
      })
  })



})