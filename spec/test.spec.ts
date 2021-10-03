import * as request from 'supertest';
import express from "express";
import { Entsoe } from "../lib/Entsoe"
import { Country } from '../lib/interfaces/countries';




describe('Electricity Generation', () => {

  beforeEach(function () {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
  });

  const app = express();
  app.use(Entsoe.init({
    securityToken: '68aa46a3-3b1b-4071-ac6b-4372830b114f'
  }));

  it('Electricity Generation Week Germany', done => {
    request.default(app)
      .get('/entsoe/10Y1001A1001A83F/generation?year=2019&week=19')
      .set('refresh', 'true')
      .timeout(60000)
      .expect(200)
      .then(response => {
        const body = response.body;
        expect(body.chartName).toBe('Generated Electricity')
        expect(body.unit).toBe('MW')
        expect(body.chartData.length).toBe(18)
        expect(body.chartData[0].data.length).toBe(672)
        expect(body.requestInterval.start).toBe('2019-05-05T00:00:00.000Z')
        expect(body.requestInterval.end).toBe('2019-05-12T00:00:00.000Z');
        expect(body.source).toBe('https://transparency.entsoe.eu/api?documentType=A75&processType=A16&in_Domain=10Y1001A1001A83F&outBiddingZone_Domain=10Y1001A1001A83F&periodStart=201905050000&periodEnd=201905120000&securityToken=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX')
        done();
      })
  })

  it('Electricity Generation Day Germany', done => {
    request.default(app)
      .get('/entsoe/10Y1001A1001A83F/generation?year=2019&month=3&day=11')
      .set('refresh', 'true')
      .timeout(60000)
      .expect(200)
      .then(response => {
        const body = response.body;
        expect(body.chartName).toBe('Generated Electricity')
        expect(body.unit).toBe('MW')
        expect(body.chartData.length).toBe(18)
        expect(body.chartData[0].data.length).toBe(96)
        expect(body.requestInterval.start).toBe('2019-03-11T00:00:00.000Z')
        expect(body.requestInterval.end).toBe('2019-03-12T00:00:00.000Z');
        expect(body.source).toBe('https://transparency.entsoe.eu/api?documentType=A75&processType=A16&in_Domain=10Y1001A1001A83F&outBiddingZone_Domain=10Y1001A1001A83F&periodStart=201903110100&periodEnd=201903120100&securityToken=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX');
        done();
      })
  })

  it('Electricity Generation Day Austria', done => {
    request.default(app)
      .get('/entsoe/10YAT-APG------L/generation?year=2019&month=3&day=11')
      .set('refresh', 'true')
      .timeout(60000)
      .expect(200)
      .then(response => {
        const body = response.body;
        expect(body.chartName).toBe('Generated Electricity')
        expect(body.unit).toBe('MW')
        expect(body.chartData.length).toBe(11)
        expect(body.chartData[0].data.length).toBe(96)
        expect(body.requestInterval.start).toBe('2019-03-11T00:00:00.000Z')
        expect(body.requestInterval.end).toBe('2019-03-12T00:00:00.000Z');
        expect(body.source).toBe('https://transparency.entsoe.eu/api?documentType=A75&processType=A16&in_Domain=10YAT-APG------L&outBiddingZone_Domain=10YAT-APG------L&periodStart=201903110100&periodEnd=201903120100&securityToken=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX');
        done();
      })
  })

  it('Solar Generation Day Austria', done => {
    request.default(app)
      .get('/entsoe/10YAT-APG------L/generation?year=2019&month=3&day=11&psrType=B16')
      .set('refresh', 'true')
      .timeout(60000)
      .expect(200)
      .then(response => {
        const body = response.body;
        expect(body.chartName).toBe('Generated Electricity')
        expect(body.unit).toBe('MW')
        expect(body.chartData.length).toBe(1)
        expect(body.chartData[0].data.length).toBe(96)
        expect(body.requestInterval.start).toBe('2019-03-11T00:00:00.000Z')
        expect(body.requestInterval.end).toBe('2019-03-12T00:00:00.000Z');
        expect(body.source).toBe('https://transparency.entsoe.eu/api?documentType=A75&processType=A16&in_Domain=10YAT-APG------L&outBiddingZone_Domain=10YAT-APG------L&periodStart=201903110100&periodEnd=201903120100&psrType=B16&securityToken=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX');
        done();
      })
  })

  it('Price Day Austria', done => {
    request.default(app)
      .get('/entsoe/10YAT-APG------L/prices?year=2021&month=3&day=11')
      .set('refresh', 'true')
      .timeout(60000)
      .expect(200)
      .then(response => {
        const body = response.body;
        expect(body.chartName).toBe('Day Ahead Prices')
        expect(body.unit).toBe('€/MW')
        expect(body.chartData.length).toBe(1)
        expect(body.chartData[0].data.length).toBe(48)
        expect(body.requestInterval.start).toBe('2021-03-11T00:00:00.000Z')
        expect(body.requestInterval.end).toBe('2021-03-12T00:00:00.000Z');
        expect(body.source).toBe('https://transparency.entsoe.eu/api?documentType=A44&in_Domain=10YAT-APG------L&out_Domain=10YAT-APG------L&periodStart=202103110100&periodEnd=202103120100&securityToken=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX');
        done();
      })
  })

  it('Hydro fill Month Austria', done => {
    request.default(app)
      .get('/entsoe/10YAT-APG------L/hydrofill?year=2021&month=3')
      .set('refresh', 'true')
      .timeout(60000)
      .expect(200)
      .then(response => {
        const body = response.body;
        expect(body.chartName).toBe('Hydro Power Fill Level')
        expect(body.unit).toBe('MWh')
        expect(body.chartData.length).toBe(1)
        expect(body.chartData[0].data.length).toBe(5)
        expect(body.requestInterval.start).toBe('2021-03-01T00:00:00.000Z');
        expect(body.requestInterval.end).toBe('2021-04-01T00:00:00.000Z');
        const startTime = new Date(body.dataInterval.start).getTime();
        const endTime = new Date(body.dataInterval.end).getTime();
        expect(startTime).toBeLessThanOrEqual((new Date('2021-03-01T00:00Z').getTime()));
        expect(endTime).toBeGreaterThanOrEqual((new Date('2021-04-01T00:00Z').getTime()))
        expect(body.source).toBe('https://transparency.entsoe.eu/api?documentType=A72&processType=A16&in_Domain=10YAT-APG------L&periodStart=202103010100&periodEnd=202104010100&securityToken=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX')
        done();
      })
  })


    it('Countries Datalist', done => {
        request.default(app)
            .get('/entsoe/datalists/countries')
            .set('refresh', 'true')
            .timeout(60000)
            .expect(200)
            .then(response => {
            const body = response.body as Country[];
            body.forEach(item => {
              expect(typeof(item.code)).toBe('string')
              expect(typeof(item.name)).toBe('string')
            })
            done();
        });
    });



})