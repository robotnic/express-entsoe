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
  it('Electricity Generation Week Germany', done => {
    request.default(app)
      .get('/entsoe/10Y1001A1001A83F/generation?year=2019&week=19')
      .set('refresh', 'false')
      .timeout(timeout)
      .expect(200)
      .then(response => {
        const body = response.body;
        expect(body.chartName).toBe('Generated Electricity')
        expect(body.unit).toBe('MW')
        expect(body.dataset.length).toBe(18)
        expect(body.dataset[0].data.length).toBe(672)
        expect(body.requestInterval.start).toBe('2019-05-05T00:00:00.000Z')
        expect(body.requestInterval.end).toBe('2019-05-12T00:00:00.000Z');
        expect(body.sources[0].url).toBe('https://web-api.tp.entsoe.eu/api?documentType=A75&processType=A16&in_Domain=10Y1001A1001A83F&outBiddingZone_Domain=10Y1001A1001A83F&periodStart=201905050000&periodEnd=201905120000&securityToken=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX')
        done();
      })
  })

  it('Electricity Generation Day Germany Etag', done => {
    request.default(app)
      .get('/entsoe/10Y1001A1001A83F/generation?year=2019&week=19&day=15')
      .set('refresh', 'true')
      //.set('If-None-Match', '36c35e1e8fec346dc78def0ac402d98c')
      .timeout(timeout)
      .expect(200)
      .then(response => {
        //        console.log(response.headers)
        request.default(app)
          .get('/entsoe/10Y1001A1001A83F/generation?year=2019&week=19&day=15')
          .set('If-None-Match', response.headers?.etag || '')
          .timeout(timeout)
          .expect(304)
          .then(response2 => {
            expect(response2.headers.eTag).toBe(response2?.headers?.eTag)
            done();
          });
      })
  })

  it('Electricity Generation Day Germany Etag not valid', done => {
    request.default(app)
      .get('/entsoe/10Y1001A1001A83F/generation?year=2019&week=19&day=15')
      //.set('refresh', 'true')
      //      .set('If-None-Match', '36c35e1e8fec346dc78def0ac402d98c')
      .timeout(timeout)
      .expect(200)
      .then(response => {
        //        console.log(response.headers)
        done()
        /*
        request.default(app)
          .get('/entsoe/10Y1001A1001A83F/generation?year=2019&week=19&day=15')
          .set('If-None-Match', response.headers.etag)
          .timeout(timeout)
          .expect(304)
          .then(response2 => {
            expect(response2.headers.eTag).toBe(response.headers.eTag)
            done();
          });
          */
      })
  })


  it('Electricity Generation Day Germany', done => {
    request.default(app)
      .get('/entsoe/10Y1001A1001A83F/generation?year=2019&month=3&day=11')
      .set('refresh', 'true')
      .timeout(timeout)
      .expect(200)
      .then(response => {
        const body = response.body;
        expect(body.chartName).toBe('Generated Electricity')
        expect(body.unit).toBe('MW')
        expect(body.dataset.length).toBe(18)
        expect(body.dataset[0].data.length).toBe(96)
        expect(body.requestInterval.start).toBe('2019-03-11T00:00:00.000Z')
        expect(body.requestInterval.end).toBe('2019-03-12T00:00:00.000Z');
        expect(body.sources[0].url).toBe('https://web-api.tp.entsoe.eu/api?documentType=A75&processType=A16&in_Domain=10Y1001A1001A83F&outBiddingZone_Domain=10Y1001A1001A83F&periodStart=201903110000&periodEnd=201903120000&securityToken=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX');
        done();
      })
  })

  it('Electricity Generation Day Austria', done => {
    request.default(app)
      .get('/entsoe/10YAT-APG------L/generation?year=2019&month=3&day=11')
      .set('refresh', 'true')
      .timeout(timeout)
      .expect(200)
      .then(response => {
        const body = response.body;
        expect(body.chartName).toBe('Generated Electricity')
        expect(body.unit).toBe('MW')
        expect(body.dataset.length).toBe(11)
        expect(body.dataset[0].data.length).toBe(96)
        expect(body.requestInterval.start).toBe('2019-03-11T00:00:00.000Z')
        expect(body.requestInterval.end).toBe('2019-03-12T00:00:00.000Z');
        expect(body.sources[0].url).toBe('https://web-api.tp.entsoe.eu/api?documentType=A75&processType=A16&in_Domain=10YAT-APG------L&outBiddingZone_Domain=10YAT-APG------L&periodStart=201903110000&periodEnd=201903120000&securityToken=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX');

        body.dataset.forEach((dataset: any) => {
          expect(typeof (dataset.label)).toBe('string')
          expect(typeof (dataset.color)).toBe('string')
          expect(typeof (dataset.psrType)).toBe('string')
        })

        done();
      })
  })

  it('Electricity Generation week France', done => {
    request.default(app)
      .get('/entsoe/10YFR-RTE------C/generation?year=2019&month=3&day=11')
      .set('refresh', 'true')
      .timeout(timeout)
      .expect(200)
      .then(response => {
        const body = response.body;
        expect(body.chartName).toBe('Generated Electricity')
        expect(body.unit).toBe('MW')
        expect(body.dataset.length).toBe(12)
        expect(body.dataset[0].data.length).toBe(24)
        expect(body.requestInterval.start).toBe('2019-03-11T00:00:00.000Z')
        expect(body.requestInterval.end).toBe('2019-03-12T00:00:00.000Z');
        expect(body.sources[0].url).toBe('https://web-api.tp.entsoe.eu/api?documentType=A75&processType=A16&in_Domain=10YFR-RTE------C&outBiddingZone_Domain=10YFR-RTE------C&periodStart=201903110000&periodEnd=201903120000&securityToken=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX');

        body.dataset.forEach((dataset: any) => {
          if (!dataset.color) {
            // console.log('---->', dataset.label, dataset.color, dataset.psrType)
          }
          expect(typeof (dataset.label)).toBe('string')
          expect(typeof (dataset.color)).toBe('string')
          expect(typeof (dataset.psrType)).toBe('string')
        })

        done();
      })
  })

  it('Electricity Generation week France - negative values', done => {
    request.default(app)
      .get('/entsoe/10YFR-RTE------C/generation?year=2021')
      .set('refresh', 'false')
      .timeout(timeout)
      .expect(200)
      .then(response => {
        const body = response.body;
        expect(body.chartName).toBe('Generated Electricity')
        expect(body.unit).toBe('MW')
        expect(body.dataset.length).toBe(14)
        expect(body.dataset[0].data.length).toBe(8760)
        expect(body.requestInterval.start).toBe('2021-01-01T00:00:00.000Z');
        expect(body.requestInterval.end).toBe('2022-01-01T00:00:00.000Z');
        expect(body.sources[0].url).toBe('https://web-api.tp.entsoe.eu/api?documentType=A75&processType=A16&in_Domain=10YFR-RTE------C&outBiddingZone_Domain=10YFR-RTE------C&periodStart=202101010000&periodEnd=202201010000&securityToken=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX');
        //console.log(body.dataset.map((item:any) => item.label))
        body.dataset.forEach((dataset: any) => {
          //console.log('---->', dataset.label, dataset.color, dataset.psrType)
          expect(typeof (dataset.label)).toBe('string')
          expect(typeof (dataset.color)).toBe('string')
          expect(typeof (dataset.psrType)).toBe('string')
        })

        done();
      })
  })




  it('Solar Generation Day Austria', done => {
    request.default(app)
      .get('/entsoe/10YAT-APG------L/generation?year=2019&month=3&day=11&psrType=B16')
      .set('refresh', 'true')
      .timeout(timeout)
      .expect(200)
      .then(response => {
        const body = response.body;
        expect(body.chartName).toBe('Generated Electricity')
        expect(body.unit).toBe('MW')
        expect(body.dataset.length).toBe(1)
        expect(body.dataset[0].data.length).toBe(72)
        expect(body.requestInterval.start).toBe('2019-03-11T00:00:00.000Z')
        expect(body.requestInterval.end).toBe('2019-03-12T00:00:00.000Z');
        expect(body.sources[0].url).toBe('https://web-api.tp.entsoe.eu/api?documentType=A75&processType=A16&in_Domain=10YAT-APG------L&outBiddingZone_Domain=10YAT-APG------L&periodStart=201903110000&periodEnd=201903120000&psrType=B16&securityToken=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX');
        done();
      })
  })
/*
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
        expect(body.requestInterval.start).toBe('2021-03-11T00:00:00.000Z')
        expect(body.requestInterval.end).toBe('2021-03-12T00:00:00.000Z');
        expect(body.sources[0].url).toBe('https://web-api.tp.entsoe.eu/api?documentType=A44&in_Domain=10YAT-APG------L&out_Domain=10YAT-APG------L&periodStart=202103110000&periodEnd=202103120000&securityToken=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX');
        done();
      })
  })

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
        expect(body.sources[0].url).toBe('https://web-api.tp.entsoe.eu/api?documentType=A72&processType=A16&in_Domain=10YAT-APG------L&periodStart=202102010000&periodEnd=202103010000&securityToken=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX')
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
        console.log(body.dataset[0].data);
        expect(body.chartName).toBe('Hydro Power Fill Level')
        expect(body.unit).toBe('MWh')
        expect(body.dataset.length).toBe(1)
        expect(body.dataset[0].data.length).toBe(53)
        body.dataset[0].data.forEach((item: any) => {
          console.log(item.y);
        })
        expect(body.requestInterval.start).toBe('2020-01-01T00:00:00.000Z');
        expect(body.requestInterval.end).toBe('2021-01-01T00:00:00.000Z');
        const startTime = new Date(body.dataInterval.start).getTime();
        const endTime = new Date(body.dataInterval.end).getTime();
        expect(startTime).toBeLessThanOrEqual((new Date('2020-01-01T00:00Z').getTime()));
        expect(endTime).toBeGreaterThanOrEqual((new Date('2021-01-01T00:00Z')).getTime() - 3600000)
        expect(body.sources[0].url).toBe('https://web-api.tp.entsoe.eu/api?documentType=A72&processType=A16&in_Domain=10YAT-APG------L&periodStart=202001010000&periodEnd=202101010000&securityToken=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX')
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
        expect(body.dataset[0].data.length).toBe(4)
        expect(body.requestInterval.start).toBe('2021-03-01T00:00:00.000Z');
        expect(body.requestInterval.end).toBe('2021-04-01T00:00:00.000Z');
        const startTime = new Date(body.dataInterval.start).getTime();
        const endTime = new Date(body.dataInterval.end).getTime();
        expect(startTime).toBeLessThanOrEqual((new Date('2021-03-01T00:00Z').getTime()));
        expect(endTime).toBeGreaterThanOrEqual((new Date('2021-04-01T00:00Z').getTime()))
        expect(body.sources[0].url).toBe('https://web-api.tp.entsoe.eu/api?documentType=A72&processType=A16&in_Domain=10YAT-APG------L&periodStart=202103010000&periodEnd=202104010000&securityToken=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX')
        done();
      })
  })

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
*/



  it('Countries Datalist', done => {
    request.default(app)
      .get('/entsoe/datalists/countries')
      .set('refresh', 'true')
      .timeout(timeout)
      .expect(200)
      .then(response => {
        const body = response.body as Country[];
        body.forEach(item => {
          expect(typeof (item.code)).toBe('string')
          expect(typeof (item.name)).toBe('string')
        })
        done();
      });
  });

  it('Error - Solar Generation Day Austria - no data for year 3000', done => {
    request.default(app)
      .get('/entsoe/10YAT-APG------L/generation?year=3000&month=3&day=11&psrType=B16')
      .set('refresh', 'true')
      .timeout(timeout)
      .expect(404)
      .then(response => {
        const body = response.body;
        expect(body.type).toBe('999')
        expect(body.title).toBe('No data from ENTSO-e')
        expect(body.status).toBe(404)
        expect(body.detail).toBe('No matching data found for Data item Aggregated Generation per Type [16.1.B&C] (10YAT-APG------L) and interval 3000-03-11T00:00:00.000Z/3000-03-12T00:00:00.000Z.')
        expect(body.instance).toBe('https://web-api.tp.entsoe.eu/api?documentType=A75&processType=A16&in_Domain=10YAT-APG------L&outBiddingZone_Domain=10YAT-APG------L&periodStart=300003110000&periodEnd=300003120000&psrType=B16&securityToken=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX');
        done();
      })
  })

  it('Error - Solar Generation Day Austria - December 32', done => {
    request.default(app)
      .get('/entsoe/10YAT-APG------L/generation?year=2020&month=12&day=32&psrType=B16')
      .set('refresh', 'true')
      .timeout(timeout)
      .expect(400)
      .then(response => {
        const body = response.body;
        expect(body.title).toBe('Invalid input')
        expect(body.status).toBe(400)
        expect(body.detail).toBe('2020-12 does not have day 32')
        done();
      })
  })

  it('Error - Solar Generation Day Austria - Nov 31', done => {
    request.default(app)
      .get('/entsoe/10YAT-APG------L/generation?year=2020&month=11&day=31&psrType=B16')
      .set('refresh', 'true')
      .timeout(timeout)
      .expect(400)
      .then(response => {
        const body = response.body;
        expect(body.title).toBe('Invalid input')
        expect(body.status).toBe(400)
        expect(body.detail).toBe('2020-11 does not have day 31')
        done();
      })
  })

  it('France - missing data', done => {
    request.default(app)
      .get('/entsoe/10YFR-RTE------C/generation?year=2020&week=24&timeType=week&country=France')
      .set('refresh', 'true')
      .timeout(timeout)
      .expect(200)
      .then(response => {
        const body = response.body;
        body.dataset.forEach((item: any) => {
          expect(body.dataset[0].data.length - item.data.length).toBe(0);
        })
        done();
      })
  })


  it('Load Swagger', done => {
    request.default(app)
      .get('/entsoe')
      .set('refresh', 'true')
      .timeout(timeout)
      .expect(200)
      .then(response => {
        const body = response.body;
        done();
      })
  })


})