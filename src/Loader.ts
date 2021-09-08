import axios, { AxiosError } from "axios";
import { parseStringPromise } from 'xml2js';
import { Chart, ChartGroup, Point } from "./interfaces/charts";
import { Entsoe, EntsoeDocument, EntsoePeriod, EntsoePoint } from "./interfaces/entsoe";
import { Config } from "./Config";
import { Duration, Period, ZonedDateTime } from 'js-joda';
import { addSeconds, getDaysInMonth } from 'date-fns';
import { InputError } from './Errors';
import QueryString from "qs";
import e from "express";


export class Loader {
  config = Config.get();
  yearRegExp = new RegExp('^\\d{4}$');

  constructor(private securityToke: string, private entsoeDomain: string) {}

  async loadCachedInstalled(country: string, query: QueryString.ParsedQs) {
    this.checkCountry(country);
    this.checkYear(query.year);
    const periodStart = `${query.year}01010000`;
    const periodEnd = `${query.year}12310000`;
    return await this.getInstalled(country, periodStart, periodEnd);
  }

  async loadInstalled(country: string, query: QueryString.ParsedQs) {
    this.checkCountry(country);
    const periodStart = this.getPeriod(query.periodStart);
    const periodEnd = this.getPeriod(query.periodEnd);
    return await this.getInstalled(country, periodStart, periodEnd);
  }

  getPeriod(period: string | QueryString.ParsedQs | string[] | QueryString.ParsedQs[] | undefined): string {
    if (typeof (period) !== 'string') {
      throw new InputError('period should be a string');
    }
    if (period.length !== 12) {
      throw new InputError('period should have 12 character. Example: 201611012300');
    }
    return period;
  }

  async getInstalled(country: string, periodStart: string, periodEnd: string) {
    const year = periodStart.substring(0, 4);
    const charts = await this.getEntsoeData(country, 'installed', periodStart, periodEnd);
    if (charts) {
      const data = charts.chartData.map(item => {
        return {
          prsType: item.prsType,
          label: item.label,
          value: item.data[0].y
        }
      })
      const response = {
        title: `Installed ${this.config.CountryCodes[country]} ${year}`,
        countryCode: country,
        year: year,
        unit: 'MW',
        source: `${this.entsoeDomain}${charts?.source}`,
        data: data,
      }
      return response
    }
  }

  async loadCachedChart(country: string, type: string, query: QueryString.ParsedQs) {
    this.checkCountry(country);
    const year = this.checkYear(query.year);
    let periodStart = `${query.year}01010000`;
    let periodEnd = `${query.year}12310000`;
    const month = this.checkMonth(query.month);
    if (month) {
      if (query.week) {
        throw new InputError('query parameter month and week cannot be used at the same time');
      }
      const day = this.checkDay(year, month, query.day);
    } else {
      if (query.week) {
        const month = this.checkWeek(query.week);
      }
    }

    let psrType;
    if (typeof (query.psrType) === 'string') {
      psrType = query.psrType;
    }
    const data = await this.getEntsoeData(country, type, periodStart, periodEnd, psrType);
    return data;
  }


  async loadChart(country: string, type: string, query: QueryString.ParsedQs) {
    this.checkCountry(country);
    const periodStart = this.getPeriod(query.periodStart);
    const periodEnd = this.getPeriod(query.periodEnd);
    let psrType;
    if (typeof (query.psrType) === 'string') {
      psrType = query.psrType;
    }
    const data = await this.getEntsoeData(country, type, periodStart, periodEnd, psrType);
    return data;
  }

  async getCountries() {
    return Object.keys(this.config.CountryCodes).map(item => {
      return {
        code: item,
        name: this.config.CountryCodes[item]
      }
    })
  }

  async getPsrTypes() {
    return Object.keys(this.config.PsrType).map(item => {
      return {
        code: item,
        name: this.config.PsrType[item]
      }
    })
  }


  checkYear(year: string | QueryString.ParsedQs | string[] | QueryString.ParsedQs[] | undefined) {
    if (typeof (year) !== 'string') {
      throw new InputError('query parameter year required');
    }
    if (!this.yearRegExp.test(year)) {
      throw new InputError('query parameter year must have four digits. Example: 2019');
    }
    return year;
  }

  checkMonth(month: string | QueryString.ParsedQs | string[] | QueryString.ParsedQs[] | undefined) {
    if (typeof (month) !== 'string') {
      throw new InputError('query parameter year required');
    }
    if (parseInt(month as any) < 1 || parseInt(month) > 12) {
      throw new InputError('query parameter month must be between 1 and 12. Example: 7');
    }
    return (month + '').padStart(2, '0');
  }

  checkDay(year: string, month: string, day: string | QueryString.ParsedQs | string[] | QueryString.ParsedQs[] | undefined) {
    if (typeof (day) !== 'string') {
      throw new InputError('query parameter day is fishy');
    }
    const daysInMonth = getDaysInMonth(new Date(parseInt(year), parseInt(month) - 1));
    if (parseInt(day) > daysInMonth || parseInt(day) < 1) {
      throw new InputError(`${year}-${month} does not have day ${day}`);
    }
    console.log(daysInMonth);
    return (day + '').padStart(2, '0');
  }

  checkWeek(week: string | QueryString.ParsedQs | string[] | QueryString.ParsedQs[] | undefined) {
    if (typeof (week) !== 'string') {
      throw new InputError('query parameter day is fishy');
    }
    if (parseInt(week) < 1 || parseInt(week) > 52) {
      throw new InputError('value for week must be between 1 and 52');
    }
    return parseInt(week);
  }




  checkCountry(country: string) {
    if (!this.config.CountryCodes[country]) {
      let text = 'Allowed values for country\n\n';
      for (const key of Object.keys(this.config.CountryCodes)) {
        text += `${key}  for ${this.config.CountryCodes[key]}\n`
      }
      throw new InputError(text);
    }
  }

  getDateTimeString(zondedDateTime: any) {
    const date = ZonedDateTime.parse(zondedDateTime);
    console.log(date);

  }


  async getEntsoeData(country: string, chartType: string, periodStart: string, periodEnd: string, psrType?: string): Promise<ChartGroup | undefined> {
    let path = '';
    let title = '';
    let unit = '';
    console.log(chartType);
    switch (chartType) {
      case 'generation':
        title = 'power generation';
        unit = 'MW';
        path = `/api?documentType=A75&processType=A16&in_Domain=${country}&outBiddingZone_Domain=${country}&periodStart=${periodStart}&periodEnd=${periodEnd}`;
        break;
      case 'load':
        title = 'total load'
        unit = 'MW';
        path = `/api?documentType=A65&processType=A16&outBiddingZone_Domain=${country}&periodStart=${periodStart}&periodEnd=${periodEnd}`;
        break;
      case 'prices':
        path = `/api?documentType=A44&in_Domain=${country}&out_Domain=${country}&periodStart=${periodStart}&periodEnd=${periodEnd}`;
        title = 'day ahead price'
        unit = '€/MW';
        break;
      case 'hydrofill':
        path = `/api?documentType=A72&processType=A16&in_Domain=${country}&periodStart=${periodStart}&periodEnd=${periodEnd}`;
        title = 'fill level'
        unit = 'MWh';
        break;
      case 'installed':
        path = `/api?documentType=A68&processType=A33&in_Domain=${country}&periodStart=${periodStart}&periodEnd=${periodEnd}`;
        title = 'installed'
        unit = 'MW';
        break;

    }
    // const path = `/api?documentType=A65&processType=A16&outBiddingZone_Domain=10YCZ-CEPS-----N&periodStart=201611302300&periodEnd=201612312300`;
    if (psrType) {
      path = `${path}&psrType=${psrType}`
    }
    const url = `${this.entsoeDomain}${path}&securityToken=${this.securityToke}`;
    console.log(url);

    let chartView: ChartGroup = {
      title: title,
      source: path,
      unit: unit,
      chartData: []
    }
    let response;
    try {
      response = await axios.get(url);
    } catch (e: any) {
      //console.trace(e.response.data);
      return e.response;
    }
    if (response) {
      console.log('.')
      //      console.log(response.data);
      const json = await parseStringPromise(response.data) as Entsoe;
      if (chartType === 'prices') {
        chartView.chartData = this.convert(json.Publication_MarketDocument);
      } else {
        chartView.chartData = this.convert(json.GL_MarketDocument);
      }
      /*
      if (chartType === 'filllevel') {
        chartView.chartData = this.combine(chartView.chartData);
      }
      */
      return chartView;
    }
  }

  convert(orig?: EntsoeDocument) {
    const charts: Chart[] = [];
    const chartsByPsrType: {
      [key: string]: Chart
    } = {};
    orig?.TimeSeries.forEach(timeSeries => {
      let i = 0;
      const period = timeSeries.Period[0];
      const durationInSeconds = this.getPeriodInSeconds(period);
      const start = new Date(period.timeInterval[0].start[0]);
      let psrType = timeSeries.MktPSRType?.[0].psrType[0] || 'unknown';
      let sign = 1;
      if (timeSeries['outBiddingZone_Domain.mRID']) {
        psrType = psrType + '___in';
        sign = -1;
      }
      const data: Point[] = period.Point.map(item => {
        const x = addSeconds(start, durationInSeconds * i++);
        const y = this.getYValue(item, sign);
        return {
          x: x.getTime(),
          y: y
        }
      })
      if (!chartsByPsrType[psrType]) {
        chartsByPsrType[psrType] = {
          label: '',
          prsType: '',
          data: []
        }
      }
      chartsByPsrType[psrType].data = chartsByPsrType[psrType].data.concat(data);
    });
    for (let key of Object.keys(chartsByPsrType)) {
      const isAllZero = chartsByPsrType[key].data.every(item => item.y === 0);
      if (!isAllZero) {
        const theKey = key.split('___')[0];
        if (key.endsWith('___in')) {
          chartsByPsrType[key].label = this.config.PsrType[theKey] + ' Up';
        } else {
          chartsByPsrType[key].label = this.config.PsrType[theKey];
        }
        chartsByPsrType[key].prsType = key;
        charts.push(chartsByPsrType[key]);

      }
    }
    return charts;
  }

  getYValue(item: EntsoePoint, sign: number): number {
    if (item.quantity) {
      return parseFloat(item.quantity[0]) * sign;
    }
    if (item["price.amount"]) {
      return parseFloat(item['price.amount'][0]);
    }
    return 0;
  }

  getPeriodInSeconds(entsoePeriod: EntsoePeriod): number {
    try {
      const duration = Duration.parse(entsoePeriod.resolution[0]);
      return duration.seconds();
    } catch (e) {
      const period = Period.parse(entsoePeriod.resolution[0])
      return period.days() * 24 * 60 * 60;
    }

  }

}