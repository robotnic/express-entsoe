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

  it('Installed Generation Austria 2020', done => {
    request.default(app)
      .get('/entsoe/10YAT-APG------L/installed?year=2020')
      .set('refresh', 'true')
      .timeout(timeout)
      .expect(200)
      .then(response => {
        const body = response.body;
        expect(body.chartName).toBe('Installed Electricity Generation')
        expect(body.unit).toBe('MW')
        expect(body.dataset.length).toBe(12)
        expect(body.requestInterval.start).toBe('2020-01-01T00:00:00.000Z');
        expect(body.requestInterval.end).toBe('2020-12-31T00:00:00.000Z');
        expect(body.sources[0].url).toBe('https://web-api.tp.entsoe.eu/api?documentType=A68&processType=A33&in_Domain=10YAT-APG------L&periodStart=202001010000&periodEnd=202012310000&securityToken=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX')

        body.dataset.forEach((dataset: any) => {
          expect(typeof (dataset.label)).toBe('string')
          expect(typeof (dataset.color)).toBe('string')
          expect(typeof (dataset.psrType)).toBe('string')
        })


        done();
      })
  })

  it('Installed Generation Austria all years', done => {
    request.default(app)
      .get('/entsoe/10YAT-APG------L/installed')
      .set('refresh', 'true')
      .timeout(timeout)
      .expect(200)
      .then(response => {
        const body = response.body;
        expect(body.chartName).toBe('Installed Electricity Generation')
        expect(body.unit).toBe('MW')
        expect(body.dataset.length).toBe(12)
        expect(body.requestInterval.start).toBe('2015-01-01T00:00:00.000Z');
        expect(body.requestInterval.end).toBe('2022-12-31T00:00:00.000Z');
        expect(body.sources[0].url).toBe('https://web-api.tp.entsoe.eu/api?documentType=A68&processType=A33&in_Domain=10YAT-APG------L&periodStart=201501010000&periodEnd=201512310000&securityToken=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX')

        body.dataset.forEach((dataset: any) => {
          expect(typeof (dataset.label)).toBe('string')
          expect(typeof (dataset.color)).toBe('string')
          expect(typeof (dataset.psrType)).toBe('string')
        })


        done();
      })
  })

  it('Installed Generation Sweden all years', done => {
    request.default(app)
      .get('/entsoe/10YSE-1--------K/installed')
      .set('refresh', 'true')
      .timeout(timeout)
      .expect(200)
      .then(response => {
        const body = response.body;
        expect(body.chartName).toBe('Installed Electricity Generation')
        expect(body.unit).toBe('MW')
        expect(body.dataset.length).toBe(4)
        expect(body.requestInterval.start).toBe('2015-01-01T00:00:00.000Z');
        expect(body.requestInterval.end).toBe('2022-12-31T00:00:00.000Z');
        expect(body.sources[0].url).toBe('https://web-api.tp.entsoe.eu/api?documentType=A68&processType=A33&in_Domain=10YSE-1--------K&periodStart=201501010000&periodEnd=201512310000&securityToken=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX')

        body.dataset.forEach((dataset: any) => {
          expect(typeof (dataset.label)).toBe('string')
          expect(typeof (dataset.color)).toBe('string')
          expect(typeof (dataset.psrType)).toBe('string')
        })


        done();
      })
  })



  it('Installed Generation France 2020', done => {
    request.default(app)
      .get('/entsoe/10YFR-RTE------C/installed?year=2020')
      .set('refresh', 'true')
      .timeout(timeout)
      .expect(200)
      .then(response => {
        const body = response.body;
        expect(body.chartName).toBe('Installed Electricity Generation')
        expect(body.unit).toBe('MW')
        expect(body.dataset.length).toBe(13)
        expect(body.requestInterval.start).toBe('2020-01-01T00:00:00.000Z');
        expect(body.requestInterval.end).toBe('2020-12-31T00:00:00.000Z');
        expect(body.sources[0].url).toBe('https://web-api.tp.entsoe.eu/api?documentType=A68&processType=A33&in_Domain=10YFR-RTE------C&periodStart=202001010000&periodEnd=202012310000&securityToken=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX')

        body.dataset.forEach((dataset: any) => {
          expect(typeof (dataset.label)).toBe('string')
          expect(typeof (dataset.color)).toBe('string')
          expect(typeof (dataset.psrType)).toBe('string')
        })


        done();
      })
  })



})