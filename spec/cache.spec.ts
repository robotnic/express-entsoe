import * as request from 'supertest';
import express from "express";
import { Entsoe } from "../lib/Entsoe"


describe('AWS Cache test', () => {
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

  it('Test if cached', done => {
    request.default(app)
      .get('/entsoe/10Y1001A1001A83F/generation?year=2018&week=28')
      .set('refresh', 'false')
      .timeout(timeout)
      .expect(200)
      .then(response => {
        request.default(app)
          .get('/entsoe/10Y1001A1001A83F/generation?year=2018&week=28')
          .set('refresh', 'false')
          .timeout(timeout)
          .expect(200)
          .then(response2 => {
            expect(response.body.sources[0].date).toBe(response2.body.sources[0].date)
            expect(response.headers.etag).toBe(response2.headers.etag)
            done();
          })
      })
  })

  it('Test refresh', done => {
    request.default(app)
      .get('/entsoe/10Y1001A1001A83F/generation?year=2018&week=29')
      .set('refresh', 'false')
      .timeout(timeout)
      .expect(200)
      .then(response => {
        request.default(app)
          .get('/entsoe/10Y1001A1001A83F/generation?year=2018&week=29')
          .set('refresh', 'true')
          .timeout(timeout)
          .expect(200)
          .then(response2 => {
            expect(response.body.sources[0].date).not.toBe(response2.body.sources[0].date)
            expect(response.headers.etag).not.toBe(response2.headers.etag)
            done();
          })
      })
  })

  it('Test ETag', done => {
    request.default(app)
      .get('/entsoe/10Y1001A1001A83F/generation?year=2018&week=30')
      .set('refresh', 'false')
      .timeout(timeout)
      .expect(200)
      .then(response => {
        const etag = response.headers['etag'];
        request.default(app)
          .get('/entsoe/10Y1001A1001A83F/generation?year=2018&week=30')
          .set('if-none-match', etag)
          .timeout(timeout)
          .expect(304)
          .then(response2 => {
            expect(response2.text).toBe('');
            done();
          })
      })
  })

  it('Test ETag + refresh', done => {
    request.default(app)
      .get('/entsoe/10Y1001A1001A83F/generation?year=2017&week=30')
      .set('refresh', 'false')
      .timeout(timeout)
      .expect(200)
      .then(response => {
        const etag = response.headers.etag;
        request.default(app)
          .get('/entsoe/10Y1001A1001A83F/generation?year=2017&week=30')
          .set('if-none-match', etag)
          .set('refresh', 'true')
          .timeout(timeout)
          .expect(200)
          .then(response2 => {
            expect(response.body.sources[0].date).not.toBe(response2.body.sources[0].date)
            done();
          })
      })
  })




})