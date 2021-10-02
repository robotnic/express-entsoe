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
    beforeEach(function () {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
    });
    const app = (0, express_1.default)();
    app.use(Entsoe_1.Entsoe.init({
        securityToken: '68aa46a3-3b1b-4071-ac6b-4372830b114f'
    }));
    it('Electricity Generation Week Germany', done => {
        request.default(app)
            .get('/entsoe/10Y1001A1001A83F/cached/generation?year=2019&week=19')
            .set('refresh', 'true')
            .timeout(60000)
            .expect(200)
            .then(response => {
            const body = response.body;
            expect(body.chartName).toBe('Generated Electricity');
            expect(body.unit).toBe('MW');
            expect(body.chartData.length).toBe(18);
            expect(body.chartData[0].data.length).toBe(672);
            expect(body.period.start).toBe('2019-05-05T00:00Z');
            expect(body.period.end).toBe('2019-05-12T00:00Z');
            expect(body.source).toBe('https://transparency.entsoe.eu/api?documentType=A75&processType=A16&in_Domain=10Y1001A1001A83F&outBiddingZone_Domain=10Y1001A1001A83F&periodStart=201905050000&periodEnd=201905120000&securityToken=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX');
            done();
        });
    });
    it('Electricity Generation Day Germany', done => {
        request.default(app)
            .get('/entsoe/10Y1001A1001A83F/cached/generation?year=2019&month=3&day=11')
            .set('refresh', 'true')
            .timeout(60000)
            .expect(200)
            .then(response => {
            const body = response.body;
            expect(body.chartName).toBe('Generated Electricity');
            expect(body.unit).toBe('MW');
            expect(body.chartData.length).toBe(18);
            expect(body.chartData[0].data.length).toBe(96);
            expect(body.period.start).toBe('2019-03-11T00:00Z');
            expect(body.period.end).toBe('2019-03-12T00:00Z');
            expect(body.source).toBe('https://transparency.entsoe.eu/api?documentType=A75&processType=A16&in_Domain=10Y1001A1001A83F&outBiddingZone_Domain=10Y1001A1001A83F&periodStart=201903110000&periodEnd=201903120000&securityToken=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX');
            done();
        });
    });
    it('Electricity Generation Day Austria', done => {
        request.default(app)
            .get('/entsoe/10YAT-APG------L/cached/generation?year=2019&month=3&day=11')
            .set('refresh', 'true')
            .timeout(60000)
            .expect(200)
            .then(response => {
            const body = response.body;
            expect(body.chartName).toBe('Generated Electricity');
            expect(body.unit).toBe('MW');
            expect(body.chartData.length).toBe(11);
            expect(body.chartData[0].data.length).toBe(96);
            expect(body.period.start).toBe('2019-03-11T00:00Z');
            expect(body.period.end).toBe('2019-03-12T00:00Z');
            expect(body.source).toBe('https://transparency.entsoe.eu/api?documentType=A75&processType=A16&in_Domain=10YAT-APG------L&outBiddingZone_Domain=10YAT-APG------L&periodStart=201903110000&periodEnd=201903120000&securityToken=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX');
            done();
        });
    });
});
