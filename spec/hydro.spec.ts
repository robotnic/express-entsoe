import * as request from 'supertest';
import express from "express";
import { Entsoe } from "../lib/Entsoe"
import { Country } from '../lib/interfaces/countries';




describe('Hydrofill', () => {
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

  it('Hydro fill Month Austria Feb', done => {
    request.default(app)
      .get('/entsoe/10YAT-APG------L/hydrofill?year=2021&month=2')
      .set('refresh', 'true')
      .timeout(timeout)
      .expect(200)
      .then(response => {
        const body = response.body;
        expect(body.chartName).toBe('Hydro Power Fill Level')
        expect(body.unit).toBe('MWh')
        expect(body.dataset.length).toBe(1)
        expect(body.dataset[0].data.length).toBe(4)
        expect(body.requestInterval.start).toBe('2021-02-01T00:00:00.000Z');
        expect(body.requestInterval.end).toBe('2021-03-01T00:00:00.000Z');
        const startTime = new Date(body.dataInterval.start).getTime();
        const endTime = new Date(body.dataInterval.end).getTime();
        expect(startTime).toBeLessThanOrEqual((new Date('2021-02-01T00:00Z').getTime()));
        expect(endTime).toBeGreaterThanOrEqual((new Date('2021-03-01T00:00Z')).getTime() - 3600000)
        expect(body.sources[0].url).toBe('https://transparency.entsoe.eu/api?documentType=A72&processType=A16&in_Domain=10YAT-APG------L&periodStart=202102010000&periodEnd=202103010000&securityToken=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX')
        done();
      })
  })

  it('Hydro fill Month Austria 2020', done => {
    request.default(app)
      .get('/entsoe/10YAT-APG------L/hydrofill?year=2020')
      .set('refresh', 'true')
      .timeout(timeout)
      .expect(200)
      .then(response => {
        const body = response.body;
        expect(body.chartName).toBe('Hydro Power Fill Level')
        expect(body.unit).toBe('MWh')
        expect(body.humanReadableDate).toBe('2020');
        expect(body.title).toBe('Austria Hydro Power Fill Level 2020');
        expect(body.dataset.length).toBe(1)
        expect(body.dataset[0].data.length).toBe(53)
        body.dataset[0].data.forEach((item: any) => {
          expect(item.y).toBeGreaterThan(0);
        })
        expect(body.requestInterval.start).toBe('2020-01-01T00:00:00.000Z');
        expect(body.requestInterval.end).toBe('2021-01-01T00:00:00.000Z');
        const startTime = new Date(body.dataInterval.start).getTime();
        const endTime = new Date(body.dataInterval.end).getTime();
        expect(startTime).toBeLessThanOrEqual((new Date('2020-01-01T00:00Z').getTime()));
        expect(endTime).toBeGreaterThanOrEqual((new Date('2021-01-01T00:00Z')).getTime() - 3600000)
        expect(body.sources[0].url).toBe('https://transparency.entsoe.eu/api?documentType=A72&processType=A16&in_Domain=10YAT-APG------L&periodStart=202001010000&periodEnd=202101010000&securityToken=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX')
        done();
      })
  })



  it('Hydro fill Month Austria March', done => {
    request.default(app)
      .get('/entsoe/10YAT-APG------L/hydrofill?year=2021&month=3')
      .set('refresh', 'true')
      .timeout(timeout)
      .expect(200)
      .then(response => {
        const body = response.body;
        expect(body.chartName).toBe('Hydro Power Fill Level')
        expect(body.unit).toBe('MWh')
        expect(body.dataset.length).toBe(1)
        expect(body.dataset[0].data.length).toBe(5)
        expect(body.dataset[0].psrType).toBe('X72')
        expect(typeof(body.dataset[0].color)).toBe('string')
        expect(body.requestInterval.start).toBe('2021-03-01T00:00:00.000Z');
        expect(body.requestInterval.end).toBe('2021-04-01T00:00:00.000Z');
        const startTime = new Date(body.dataInterval.start).getTime();
        const endTime = new Date(body.dataInterval.end).getTime();
        expect(startTime).toBeLessThanOrEqual((new Date('2021-03-01T00:00Z').getTime()));
        expect(endTime).toBeGreaterThanOrEqual((new Date('2021-04-01T00:00Z').getTime()))
        expect(body.sources[0].url).toBe('https://transparency.entsoe.eu/api?documentType=A72&processType=A16&in_Domain=10YAT-APG------L&periodStart=202103010000&periodEnd=202104010000&securityToken=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX')
        done();
      })
  })

})