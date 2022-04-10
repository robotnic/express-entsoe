"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const request = __importStar(require("supertest"));
const express_1 = __importDefault(require("express"));
const Entsoe_1 = require("../lib/Entsoe");
describe('Electricity Generation', () => {
    const timeout = 120000;
    beforeEach(function () {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
    });
    const app = (0, express_1.default)();
    if (process.env.securityToken) {
        app.use(Entsoe_1.Entsoe.init({
            securityToken: process.env.securityToken,
            awsBucket: process.env.awsBucket,
            awsSecretAccessKey: process.env.awsSecretAccessKey,
            awsAccessKeyId: process.env.awsAccessKeyId,
            awsRegion: process.env.awsRegion
        }));
    }
    else {
        console.log('process.env.securityToken missing');
    }
    it('Electricity Generation Week Germany', done => {
        request.default(app)
            .get('/entsoe/10Y1001A1001A83F/generation?year=2019&week=19')
            .set('refresh', 'true')
            .timeout(timeout)
            .expect(200)
            .then(response => {
            const body = response.body;
            expect(body.chartName).toBe('Generated Electricity');
            expect(body.unit).toBe('MW');
            expect(body.dataset.length).toBe(18);
            expect(body.dataset[0].data.length).toBe(672);
            expect(body.requestInterval.start).toBe('2019-05-05T00:00:00.000Z');
            expect(body.requestInterval.end).toBe('2019-05-12T00:00:00.000Z');
            expect(body.sources[0].url).toBe('https://transparency.entsoe.eu/api?documentType=A75&processType=A16&in_Domain=10Y1001A1001A83F&outBiddingZone_Domain=10Y1001A1001A83F&periodStart=201905050000&periodEnd=201905120000&securityToken=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX');
            done();
        });
    });
    it('Electricity Generation Day Germany', done => {
        request.default(app)
            .get('/entsoe/10Y1001A1001A83F/generation?year=2019&month=3&day=11')
            .set('refresh', 'true')
            .timeout(timeout)
            .expect(200)
            .then(response => {
            const body = response.body;
            expect(body.chartName).toBe('Generated Electricity');
            expect(body.unit).toBe('MW');
            expect(body.dataset.length).toBe(18);
            expect(body.dataset[0].data.length).toBe(96);
            expect(body.requestInterval.start).toBe('2019-03-11T00:00:00.000Z');
            expect(body.requestInterval.end).toBe('2019-03-12T00:00:00.000Z');
            expect(body.sources[0].url).toBe('https://transparency.entsoe.eu/api?documentType=A75&processType=A16&in_Domain=10Y1001A1001A83F&outBiddingZone_Domain=10Y1001A1001A83F&periodStart=201903110000&periodEnd=201903120000&securityToken=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX');
            done();
        });
    });
    it('Electricity Generation Day Austria', done => {
        request.default(app)
            .get('/entsoe/10YAT-APG------L/generation?year=2019&month=3&day=11')
            .set('refresh', 'true')
            .timeout(timeout)
            .expect(200)
            .then(response => {
            const body = response.body;
            expect(body.chartName).toBe('Generated Electricity');
            expect(body.unit).toBe('MW');
            expect(body.dataset.length).toBe(11);
            expect(body.dataset[0].data.length).toBe(96);
            expect(body.requestInterval.start).toBe('2019-03-11T00:00:00.000Z');
            expect(body.requestInterval.end).toBe('2019-03-12T00:00:00.000Z');
            expect(body.sources[0].url).toBe('https://transparency.entsoe.eu/api?documentType=A75&processType=A16&in_Domain=10YAT-APG------L&outBiddingZone_Domain=10YAT-APG------L&periodStart=201903110000&periodEnd=201903120000&securityToken=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX');
            done();
        });
    });
    it('Solar Generation Day Austria', done => {
        request.default(app)
            .get('/entsoe/10YAT-APG------L/generation?year=2019&month=3&day=11&psrType=B16')
            .set('refresh', 'true')
            .timeout(timeout)
            .expect(200)
            .then(response => {
            const body = response.body;
            expect(body.chartName).toBe('Generated Electricity');
            expect(body.unit).toBe('MW');
            expect(body.dataset.length).toBe(1);
            expect(body.dataset[0].data.length).toBe(96);
            expect(body.requestInterval.start).toBe('2019-03-11T00:00:00.000Z');
            expect(body.requestInterval.end).toBe('2019-03-12T00:00:00.000Z');
            expect(body.sources[0].url).toBe('https://transparency.entsoe.eu/api?documentType=A75&processType=A16&in_Domain=10YAT-APG------L&outBiddingZone_Domain=10YAT-APG------L&periodStart=201903110000&periodEnd=201903120000&psrType=B16&securityToken=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX');
            done();
        });
    });
    it('Price Day Austria', done => {
        request.default(app)
            .get('/entsoe/10YAT-APG------L/prices?year=2021&month=3&day=11')
            .set('refresh', 'true')
            .timeout(timeout)
            .expect(200)
            .then(response => {
            const body = response.body;
            expect(body.chartName).toBe('Day Ahead Prices');
            expect(body.unit).toBe('€/MW');
            expect(body.dataset.length).toBe(1);
            expect(body.dataset[0].data.length).toBe(48);
            expect(body.requestInterval.start).toBe('2021-03-11T00:00:00.000Z');
            expect(body.requestInterval.end).toBe('2021-03-12T00:00:00.000Z');
            expect(body.sources[0].url).toBe('https://transparency.entsoe.eu/api?documentType=A44&in_Domain=10YAT-APG------L&out_Domain=10YAT-APG------L&periodStart=202103110000&periodEnd=202103120000&securityToken=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX');
            done();
        });
    });
    it('Hydro fill Month Austria Feb', done => {
        request.default(app)
            .get('/entsoe/10YAT-APG------L/hydrofill?year=2021&month=2')
            .set('refresh', 'true')
            .timeout(timeout)
            .expect(200)
            .then(response => {
            const body = response.body;
            expect(body.chartName).toBe('Hydro Power Fill Level');
            expect(body.unit).toBe('MWh');
            expect(body.dataset.length).toBe(1);
            expect(body.dataset[0].data.length).toBe(4);
            expect(body.requestInterval.start).toBe('2021-02-01T00:00:00.000Z');
            expect(body.requestInterval.end).toBe('2021-03-01T00:00:00.000Z');
            const startTime = new Date(body.dataInterval.start).getTime();
            const endTime = new Date(body.dataInterval.end).getTime();
            expect(startTime).toBeLessThanOrEqual((new Date('2021-02-01T00:00Z').getTime()));
            expect(endTime).toBeGreaterThanOrEqual((new Date('2021-03-01T00:00Z')).getTime() - 3600000);
            expect(body.sources[0].url).toBe('https://transparency.entsoe.eu/api?documentType=A72&processType=A16&in_Domain=10YAT-APG------L&periodStart=202102010000&periodEnd=202103010000&securityToken=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX');
            done();
        });
    });
    it('Hydro fill Month Austria March', done => {
        request.default(app)
            .get('/entsoe/10YAT-APG------L/hydrofill?year=2021&month=3')
            .set('refresh', 'true')
            .timeout(timeout)
            .expect(200)
            .then(response => {
            const body = response.body;
            expect(body.chartName).toBe('Hydro Power Fill Level');
            expect(body.unit).toBe('MWh');
            expect(body.dataset.length).toBe(1);
            expect(body.dataset[0].data.length).toBe(5);
            expect(body.requestInterval.start).toBe('2021-03-01T00:00:00.000Z');
            expect(body.requestInterval.end).toBe('2021-04-01T00:00:00.000Z');
            const startTime = new Date(body.dataInterval.start).getTime();
            const endTime = new Date(body.dataInterval.end).getTime();
            expect(startTime).toBeLessThanOrEqual((new Date('2021-03-01T00:00Z').getTime()));
            expect(endTime).toBeGreaterThanOrEqual((new Date('2021-04-01T00:00Z').getTime()));
            expect(body.sources[0].url).toBe('https://transparency.entsoe.eu/api?documentType=A72&processType=A16&in_Domain=10YAT-APG------L&periodStart=202103010000&periodEnd=202104010000&securityToken=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX');
            done();
        });
    });
    it('Installed Generation Austria 2020', done => {
        request.default(app)
            .get('/entsoe/10YAT-APG------L/installed?year=2020')
            .set('refresh', 'true')
            .timeout(timeout)
            .expect(200)
            .then(response => {
            const body = response.body;
            expect(body.chartName).toBe('Installed Power');
            expect(body.unit).toBe('MW');
            expect(body.dataset.length).toBe(12);
            expect(body.requestInterval.start).toBe('2020-01-01T00:00:00.000Z');
            expect(body.requestInterval.end).toBe('2020-12-31T00:00:00.000Z');
            expect(body.sources[0].url).toBe('https://transparency.entsoe.eu/api?documentType=A68&processType=A33&in_Domain=10YAT-APG------L&periodStart=202001010000&periodEnd=202012310000&securityToken=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX');
            done();
        });
    });
    it('Countries Datalist', done => {
        request.default(app)
            .get('/entsoe/datalists/countries')
            .set('refresh', 'true')
            .timeout(timeout)
            .expect(200)
            .then(response => {
            const body = response.body;
            body.forEach(item => {
                expect(typeof (item.code)).toBe('string');
                expect(typeof (item.name)).toBe('string');
            });
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
            expect(body.type).toBe('999');
            expect(body.title).toBe('No data from ENTSO-e');
            expect(body.status).toBe(404);
            expect(body.detail).toBe('No matching data found for Data item Aggregated Generation per Type [16.1.B&C] (10YAT-APG------L) and interval 3000-03-11T00:00:00.000Z/3000-03-12T00:00:00.000Z.');
            expect(body.instance).toBe('https://transparency.entsoe.eu/api?documentType=A75&processType=A16&in_Domain=10YAT-APG------L&outBiddingZone_Domain=10YAT-APG------L&periodStart=300003110000&periodEnd=300003120000&psrType=B16&securityToken=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX');
            done();
        });
    });
    it('Error - Solar Generation Day Austria - December 32', done => {
        request.default(app)
            .get('/entsoe/10YAT-APG------L/generation?year=2020&month=12&day=32&psrType=B16')
            .set('refresh', 'true')
            .timeout(timeout)
            .expect(400)
            .then(response => {
            const body = response.body;
            expect(body.title).toBe('Invalid input');
            expect(body.status).toBe(400);
            expect(body.detail).toBe('2020-12 does not have day 32');
            done();
        });
    });
    it('Error - Solar Generation Day Austria - Nov 31', done => {
        request.default(app)
            .get('/entsoe/10YAT-APG------L/generation?year=2020&month=11&day=31&psrType=B16')
            .set('refresh', 'true')
            .timeout(timeout)
            .expect(400)
            .then(response => {
            const body = response.body;
            expect(body.title).toBe('Invalid input');
            expect(body.status).toBe(400);
            expect(body.detail).toBe('2020-11 does not have day 31');
            done();
        });
    });
    it('France - missing data', done => {
        request.default(app)
            .get('/entsoe/10YFR-RTE------C/generation?year=2020&week=24&timeType=week&country=France')
            .set('refresh', 'true')
            .timeout(timeout)
            .expect(200)
            .then(response => {
            const body = response.body;
            body.dataset.forEach((item) => {
                expect(body.dataset[0].data.length - item.data.length).toBe(0);
            });
            done();
        });
    });
});
