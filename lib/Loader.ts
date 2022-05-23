import axios from "axios";
import { parseStringPromise } from 'xml2js';
import { Chart, ChartGroup, Point, Source } from "./interfaces/charts";
import { Entsoe, EntsoeDocument, EntsoePeriod, EntsoePoint } from "./interfaces/entsoe";
import { Config, ConfigType } from "./Config";
import { Duration, Period } from 'js-joda';
import { addSeconds, differenceInDays, max, parse } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { InputError, UpstreamError } from "./Errors";
import { Country } from "./interfaces/countries";
import { PsrType } from "./interfaces/psrTypes";


export class Loader {
  config: ConfigType = Config.get();
  yearRegExp = new RegExp('^\\d{4}$');
  order = ["A05", "B20", "B17", "B1", "B11", "B14", "B02", "B03", "B04", "B05", "B06", "B07", "B08", "B09", "B13", "B15", "B18", "B19", "B10", "B12", "B16"]

  constructor(private securityToke: string, private entsoeDomain: string) { }

  async getInstalled(country: string, periodStart: string, periodEnd: string): Promise<ChartGroup> {
    const year = periodStart.substring(0, 4);
    const charts = await this.getEntsoeData(country, 'installed', periodStart, periodEnd);
    const chartType = 'installed';
    const chartName = this.config.chartNames[chartType];
    const countryName = this.config.CountryCodes[country];

    const data = charts.dataset.map(item => {
      return {
        psrType: item.psrType,
        label: item.label,
        value: item.data?.[0].y,
        color: this.config.colors[item.psrType || ''] || 'pink'
      }
    })
    const response = {
      title: `Installed ${this.config.CountryCodes[country]} ${year}`,
      countryCode: country,
      country: countryName,
      chartType: chartType,
      chartName: chartName,
      humanReadableDate: year,
      unit: 'MW',
      sources: charts?.sources,
      dataset: data,
      requestInterval: this.makeRequestedPeriod(periodStart, periodEnd),
    }
    return response
  }
  getCountries(): Country[] {
    return Object.keys(this.config.CountryCodes).map(item => {
      return {
        code: item,
        name: this.config.CountryCodes[item]
      }
    })
  }

  getPsrTypes(): PsrType[] {
    return Object.keys(this.config.PsrType).map(item => {
      return {
        code: item,
        name: this.config.PsrType[item]
      }
    })
  }

  checkCountry(country: string): void {
    if (!this.config.CountryCodes[country]) {
      let text = 'Allowed values for country\n\n';
      for (const key of Object.keys(this.config.CountryCodes)) {
        text += `${key}  for ${this.config.CountryCodes[key]}\n`
      }
      throw new InputError(text);
    }
  }

  periodToDate(period: string): Date {
    const isoDate = `${period.substr(0, 4)}-${period.substr(4, 2)}-${period.substr(6, 2)}T00:00Z`;
    return new Date(isoDate);
  }

  makeRequestedPeriod(periodStart: string, periodEnd: string): { start: string, end: string } {
    const start = this.periodToDate(periodStart).toISOString();
    const end = this.periodToDate(periodEnd).toISOString();

    return {
      start: start,
      end: end
    }
  }


  async getEntsoeData(country: string, chartType: string, periodStart: string, periodEnd: string, psrType?: string): Promise<ChartGroup> {
    let path = '';
    let unit = '';
    switch (chartType) {
      case 'generation':
        unit = 'MW';
        path = `/api?documentType=A75&processType=A16&in_Domain=${country}&outBiddingZone_Domain=${country}&periodStart=${periodStart}&periodEnd=${periodEnd}`;
        break;
      case 'generation_per_plant':
        unit = 'MW';
        path = `/api?documentType=A73&processType=A16&in_Domain=${country}&outBiddingZone_Domain=${country}&periodStart=${periodStart}&periodEnd=${periodEnd}`;
        break;
      case 'load':
        unit = 'MW';
        path = `/api?documentType=A65&processType=A16&outBiddingZone_Domain=${country}&periodStart=${periodStart}&periodEnd=${periodEnd}`;
        break;
      case 'prices':
        path = `/api?documentType=A44&in_Domain=${country}&out_Domain=${country}&periodStart=${periodStart}&periodEnd=${periodEnd}`;
        unit = '€/MW';
        break;
      case 'hydrofill':
        path = `/api?documentType=A72&processType=A16&in_Domain=${country}&periodStart=${periodStart}&periodEnd=${periodEnd}`;
        unit = 'MWh';
        break;
      case 'installed':
        path = `/api?documentType=A68&processType=A33&in_Domain=${country}&periodStart=${periodStart}&periodEnd=${periodEnd}`;
        unit = 'MW';
        break;

    }
    // const path = `/api?documentType=A65&processType=A16&outBiddingZone_Domain=10YCZ-CEPS-----N&periodStart=201611302300&periodEnd=201612312300`;
    if (psrType) {
      path = `${path}&psrType=${psrType}`
    }
    const chartName = this.config.chartNames[chartType];
    const countryName = this.config.CountryCodes[country];
    const url = `${this.entsoeDomain}${path}&securityToken=${this.securityToke}`;
    const sources = [{
      title: `Entsoe Data - ${chartName} - ${countryName}`,
      url: `${this.entsoeDomain}${path}&securityToken=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX`
    }];


    // console.log(url);
    const options = { headers: { 'User-Agent': 'Caching proxy for https://www.powercalculator.eu/' } }
    const response = await axios.get(url, options);
    // console.log(response);
    const json = await parseStringPromise(response.data) as Entsoe;
    let dataset;
    let start;
    let end;
    this.handleError(json, sources);
    if (chartType === 'prices') {
      [dataset, start, end] = this.convert(json.Publication_MarketDocument);
    } else {
      [dataset, start, end] = this.convert(json.GL_MarketDocument);
    }
    const requestInterval = this.makeRequestedPeriod(periodStart, periodEnd);
    const hrDate = this.makeHrDate(new Date(requestInterval.start || ''), new Date(requestInterval.end || ''));
    const chartView: ChartGroup = {
      chartName: chartName,
      chartType: chartType,
      country: countryName,
      countryCode: country,
      sources: sources,
      unit: unit,
      requestInterval: requestInterval,
      dataInterval: { start: start, end: end },
      humanReadableDate: hrDate,
      title: `${countryName} ${chartName} ${hrDate}`,
      dataset: dataset
    }
    return chartView;
  }

  convert(orig?: EntsoeDocument): [Chart[], string | undefined, string | undefined] {
    const timePeriod = orig?.['time_Period.timeInterval'] || orig?.['period.timeInterval'];
    const start = timePeriod?.[0].start[0];
    const end = timePeriod?.[0].end[0];
    const charts: Chart[] = [];
    const chartsByPsrType: {
      [key: string]: Chart
    } = {};
    orig?.TimeSeries.forEach((timeSeries, index) => {
      let i = 0;
      const period = timeSeries.Period[0];
      const durationInSeconds = this.getPeriodInSeconds(period);
      const start2 = new Date(period.timeInterval[0].start[0]);
      let psrType = timeSeries.MktPSRType?.[0].psrType[0] || 'unknown';
      if (psrType === 'unknown') {
        if (orig?.type?.[0] === 'A72') {
          psrType = 'X72'
        }
      }
      let sign = 1;
      if (timeSeries['outBiddingZone_Domain.mRID']) {
        psrType = psrType + '___in';
        sign = -1;
      }
      const data: Point[] = period.Point.map(item => {
        const x = addSeconds(start2, durationInSeconds * i++);
        const y = this.getYValue(item, sign);
        return {
          x: x.toISOString(),
          y: y
        }
      })
      if (!chartsByPsrType[psrType]) {
        chartsByPsrType[psrType] = {
          label: '',
          psrType: '',
          data: this.makeNullValueData(start, end, durationInSeconds),
          intervalInHours: durationInSeconds / 3600
        }
      }
      if (durationInSeconds === 0) {
        // for installed
        chartsByPsrType[psrType].data = chartsByPsrType[psrType].data?.concat(data);
      } else {
        this.fillData(chartsByPsrType[psrType].data, data);
      }
    });
    for (const key of Object.keys(chartsByPsrType)) {
      const typeChart = chartsByPsrType[key];
      if (Array.isArray(typeChart?.data)) {
        const isAllZero = chartsByPsrType[key].data?.every(item => Math.abs(item.y) < 10);
        if (!isAllZero) {
          const theKey = key.split('___')[0];
          if (key.endsWith('___in')) {
            typeChart.label = this.config.PsrType[theKey] + ' Up';
          } else {
            typeChart.label = this.config.PsrType[theKey];
          }
          typeChart.color = this.config.colors[theKey];
          typeChart.psrType = theKey;
          charts.push(typeChart);
        }
      }
    }
    this.removeNullsAtTheEnd(charts);
    /*
    charts.forEach(item => {
      console.log(item.psrType, item.label, item.color)
    })
    */
    const sortedCharts = charts.sort((a, b) => {
      return this.order.indexOf(a?.psrType || '') - this.order.indexOf(b?.psrType || '');
    })
    return [sortedCharts, start, end];
  }

  fillData(target: Point[] | undefined, addedPoints: Point[]): void {
    if (target) {
      target.forEach(targetPoint => {
        const sourcePoint = addedPoints.find(point => point.x === targetPoint.x);
        if (sourcePoint) {
          targetPoint.y = sourcePoint.y;
          addedPoints = addedPoints.filter(point => point.x !== targetPoint.x);
        }
      })
      // not found, find the nearest
      if (addedPoints.length > 0) {
        const times = target.map((item: any) => (new Date(item.x).getTime()))
        addedPoints.forEach(point => {
          const index = this.findClosestIndex(times, (new Date(point.x)).getTime());
          if (target[index] && target[index].y === 0) {
            target[index].y = point.y;
          }
        })
      }
    }
  }

  findClosestIndex(arr: any[], element: number): number {
    let from = 0, until = arr.length - 1
    while (true) {
      const cursor = Math.floor((from + until) / 2);
      if (cursor === from) {
        const diff1 = element - arr[from];
        const diff2 = arr[until] - element;
        return diff1 <= diff2 ? from : until;
      }

      const found = arr[cursor];
      if (found === element) return cursor;

      if (found > element) {
        until = cursor;
      } else if (found < element) {
        from = cursor;
      }
    }
  }

  makeNullValueData(start: string | undefined, end: string | undefined, durationInSeconds: number): Point[] {
    const pointArray: Point[] = [];
    if (start && end && durationInSeconds) {
      const startTime = new Date(start).getTime();
      const endTime = new Date(end).getTime();
      for (let t = startTime; t < endTime; t += durationInSeconds * 1000) {
        pointArray.push({
          x: (new Date(t).toISOString()),
          y: 0
        })
      }
    }
    return pointArray;
  }

  removeNullsAtTheEnd(charts: Chart[]): void {
    let longest = 0;
    charts.forEach(chart => {
      chart.data?.forEach((item, i) => {
        if (i > longest && item.y) {
          longest = i;
        }
      })
    })
    charts.forEach(chart => {
      if (chart.data) {
        chart.data.length = (longest + 1);
      }
    })
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
  getUTC(period: string): Date {
    return parse(period, 'yyyyMMddHHmm', new Date());
  }


  makeHrDate(start: Date, end: Date): string {
    // console.log(start, end);
    const days = differenceInDays(end, start);
    let dateString = formatInTimeZone(start, 'utc', 'yyyy MMM dd')
    if (days > 2) {
      const year = formatInTimeZone(start, 'utc', 'yyyy')
      const monthStart = formatInTimeZone(start, 'utc', 'MMM')
      const monthEnd = formatInTimeZone(end, 'utc', 'MMM')
      dateString = `${year} ${monthStart} ${formatInTimeZone(start, 'utc', 'dd')} - ${monthEnd} ${formatInTimeZone(end, 'utc', 'dd')}`
    }
    if (days > 8) {
      dateString = formatInTimeZone(start, 'utc', 'yyyy MMMM')
    }

    if (days > 40) {
      dateString = formatInTimeZone(start, 'utc', 'yyyy')
    }
    const title = `${dateString}`;
    return title;

  }

  handleError(json: Entsoe, sources: Source[]): void {
    if (json.Acknowledgement_MarketDocument) {
      const error = json.Acknowledgement_MarketDocument;
      throw new UpstreamError({
        "type": error.Reason[0].code[0],
        "title": "No data from ENTSO-e",
        "status": 404,
        "detail": error.Reason[0].text[0],
        "instance": sources[0].url || ''
      })

    }
  }
}