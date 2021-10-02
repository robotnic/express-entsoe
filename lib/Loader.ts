import axios, { AxiosError } from "axios";
import { parseStringPromise } from 'xml2js';
import { Chart, ChartGroup, Point } from "./interfaces/charts";
import { Entsoe, EntsoeDocument, EntsoePeriod, EntsoePoint } from "./interfaces/entsoe";
import { Config, ConfigType } from "./Config";
import { Duration, Period, ZonedDateTime } from 'js-joda';
import { addSeconds, differenceInDays, format, getISOWeek, parse } from 'date-fns';
import { InputError } from './Errors';
import { getUnpackedSettings } from "http2";
import { start } from "repl";


export class Loader {
  config: ConfigType = Config.get();
  yearRegExp = new RegExp('^\\d{4}$');
  order = ["A05", "B20", "B17", "B1", "B11", "B14", "B02", "B03", "B04", "B05", "B06", "B07", "B08", "B09", "B10", "B12", "B13", "B15", "B16", "B18", "B19"]


  constructor(private securityToke: string, private entsoeDomain: string) { }
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
        source: `${charts?.source}`,
        data: data,
      }
      return response
    }
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

  }


  async getEntsoeData(country: string, chartType: string, periodStart: string, periodEnd: string, psrType?: string): Promise<ChartGroup | undefined> {
    let path = '';
    let title = '';
    let unit = '';
    switch (chartType) {
      case 'generation':
        title = 'power generation';
        unit = 'MW';
        path = `/api?documentType=A75&processType=A16&in_Domain=${country}&outBiddingZone_Domain=${country}&periodStart=${periodStart}&periodEnd=${periodEnd}`;
        break;
      case 'generation_per_plant':
        title = 'power generation per plant';
        unit = 'MW';
        path = `/api?documentType=A73&processType=A16&in_Domain=${country}&outBiddingZone_Domain=${country}&periodStart=${periodStart}&periodEnd=${periodEnd}`;
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
    const source = `${this.entsoeDomain}${path}&securityToken=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX`;
    const countryName = this.config.CountryCodes[country];
    const chartName = this.config.chartNames[chartType];


    let response;
    try {
      response = await axios.get(url);
    } catch (e: any) {
      //console.trace(e.response.data);
      return e.response;
    }
    if (response) {
      //      console.log(response.data);
      const json = await parseStringPromise(response.data) as Entsoe;
      let chartData;
      let start;
      let end;
      if (chartType === 'prices') {
        [chartData, start, end] = this.convert(json.Publication_MarketDocument);
      } else {
        [chartData, start, end] = this.convert(json.GL_MarketDocument);
      }
      const hrDate = this.makeHrDate(new Date(start||''), new Date(end||''));
      let chartView: ChartGroup = {
        chartName: chartName,
        chartType: chartType,
        country: countryName,
        source: source,
        unit: unit,
        period: {
          start: start,
          end: end
        },
        hrDate: hrDate,
        title: `${country} ${chartName} ${hrDate}`,


        chartData: chartData
      }
      return chartView;
    }
  }

  convert(orig?: EntsoeDocument): [Chart[], string|undefined, string|undefined] {
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
          x: x.toISOString(),
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
      const isAllZero = chartsByPsrType[key].data.every(item => Math.abs(item.y) < 10);
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
    let dateString = format(start, 'yyyy MMM dd')
    if (days > 2) {
      let year = format(start, 'yyyy')
      let monthStart = format(start, 'MMM')
      let monthEnd = format(end, 'MMM')
      dateString = `${year} ${monthStart} ${format(start, 'dd')} - ${monthEnd} ${format(end, 'dd')}`
    }
    if (days > 8) {
      dateString = format(start, 'yyyy MMM')
    }

    if (days > 40) {
      dateString = format(start, 'yyyy')
    }
    const title = `${dateString}`;
    return title;

  };
}