import axios from "axios";
import { parseStringPromise } from 'xml2js';
import { Chart, ChartGroup, Point, Source } from "./interfaces/charts";
import { Entsoe, EntsoeDocument, EntsoePeriod, EntsoePoint } from "./interfaces/entsoe";
import { Config, ConfigType } from "./Config";
import { Duration, Period } from 'js-joda';
import { addSeconds, differenceInDays, parse} from 'date-fns';
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
        prsType: item.prsType,
        label: item.label,
        value: item.data?.[0].y,
        color: this.config.colors[item?.prsType || '']
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
    const url = `${this.entsoeDomain}${path}&securityToken=${this.securityToke}`;
    const sources = [{
      title: 'Entsoe data',
      url:`${this.entsoeDomain}${path}&securityToken=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX`
    }];
    const countryName = this.config.CountryCodes[country];
    const chartName = this.config.chartNames[chartType];


    //      console.log(url);
    const response = await axios.get(url);
    //      console.log(response.data);
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
    const hrDate = this.makeHrDate(new Date(start || ''), new Date(end || ''));
    const chartView: ChartGroup = {
      chartName: chartName,
      chartType: chartType,
      country: countryName,
      countryCode: country,
      sources: sources,
      unit: unit,
      requestInterval: this.makeRequestedPeriod(periodStart, periodEnd),
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
    orig?.TimeSeries.forEach(timeSeries => {
      let i = 0;
      const period = timeSeries.Period[0];
      const durationInSeconds = this.getPeriodInSeconds(period);
      const start2 = new Date(period.timeInterval[0].start[0]);
      let psrType = timeSeries.MktPSRType?.[0].psrType[0] || 'unknown';
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
          prsType: '',
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
      const isAllZero = chartsByPsrType[key].data?.every(item => Math.abs(item.y) < 10);
      if (!isAllZero) {
        const theKey = key.split('___')[0];
        if (key.endsWith('___in')) {
          chartsByPsrType[key].label = this.config.PsrType[theKey] + ' Up';
        } else {
          chartsByPsrType[key].label = this.config.PsrType[theKey];
        }
        chartsByPsrType[key].color = this.config.colors[key];
        chartsByPsrType[key].prsType = theKey;
        charts.push(chartsByPsrType[key]);

      }
    }
    const sortedCharts = charts.sort((a, b) => {
      return this.order.indexOf(a?.prsType || '') - this.order.indexOf(b?.prsType || '');
    })
    return [sortedCharts, start, end];
  }

  fillData(target: Point[] | undefined, addedPoints: Point[]): void {
    if (target) {
      target.forEach(targetPoint => {
        const sourcePoint = addedPoints.find(point => point.x === targetPoint.x);
        if (sourcePoint) {
          targetPoint.y = sourcePoint.y;
        }
      })
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