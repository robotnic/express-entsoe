import axios from 'axios';

interface Chart {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  datasets: Dataset[]
}

interface Fossiles {
  [key: string]: EurostatParams
}
interface EurostatParams {
  chartType: string;
  siec: string;
  nrg_bal: string;
  unit: string;
  freq: string;
}
interface Dataset {
  label: string,
  data: number[];
  backgroundColor: string;
}
interface Item {
  x: string;
  y: number
}

export class Eurostat {

  allFossil: Fossiles = {
    Gas: {
      chartType: 'NRG_CB_GASM',
      siec: 'G3000',
      nrg_bal: 'IC_OBS',
      unit: 'TJ_GCV',
      freq: 'M'
    },
    Gas4electricity: {
      chartType: 'NRG_CB_GASM',
      siec: 'G3000',
      nrg_bal: 'TI_EHG_MAP',
      unit: 'TJ_GCV',
      freq: 'M'
    },

    Gasoline: {
      chartType: 'NRG_CB_OILM',
      siec: 'O4652',
      nrg_bal: 'GID_OBS',
      unit: 'THS_T',
      freq: 'M'
    },

    Diesel: {
      chartType: 'NRG_CB_OILM',
      siec: 'O46711',
      nrg_bal: 'GID_OBS',
      unit: 'THS_T',
      freq: 'M'
    },

    Kerosin: {
      chartType: 'NRG_CB_OILM',
      siec: 'O4661',
      nrg_bal: 'GID_OBS',
      unit: 'THS_T',
      freq: 'M'

    }
  };
  keys = ['Kerosin', 'Gasoline', 'Diesel', 'Gas', 'Gas4electricity']
  colors = ['red', 'blue', 'purple', 'orange', 'green', 'lime'];

  async start(country: string, year: string):Promise<any> {
    let datasets = [];
    var i = 0;
    for (var key of this.keys) {
      const dataset: Dataset = {
        label: key,
        data: await this.load(this.allFossil[key], country, year, key),
        backgroundColor: this.colors[i]
      }
      datasets.push(dataset);
      i++;
    }
    datasets = this.removeElectricGas(datasets);
    const chart:Chart = {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      datasets: datasets
    }
    return chart
  }

  removeElectricGas(datasets:Dataset[]) {
    const gas = datasets.find(item => item.label === 'Gas');
    const gasEl = datasets.find(item => item.label === 'Gas4electricity');
    gas?.data?.forEach((item, i) => {
      if (gasEl) {
        gas.data[i] = item - gasEl.data[i]
      }
    })
    return datasets.filter(item => item.label !== 'Gas4electricity');
  }

  async load(fossil: any, geo: string, year: string, key: string):Promise<any> {
    const baseUrl = 'https://ec.europa.eu/eurostat/api/dissemination/sdmx/2.1/data/'
    const select = `${fossil.chartType}/${fossil.freq}.${fossil.nrg_bal}.${fossil.siec}.${fossil.unit}.${geo}`;
    const rest = `?format=JSON&lang=en&startPeriod=${year}-01&endPeriod=${year}-12`
    const url = `${baseUrl}${select}${rest}`
    console.log(url);
    const response = await axios.get(url);
    return this.units(response.data.value, key);
  }

  units(values: number, key: string):any {

    return Object.values(values).map(item => {
      if (key === 'Gasoline') {
        return Math.round(item * 11.6) / 1000;
      }
      if (key === 'Diesel') {
        return Math.round(item * 11.8) / 1000;
      }
      if (key === 'Kerosin') {
        return Math.round(item * 11.9) / 1000;
      }
      if (key.startsWith('Gas')) {
        return Math.round(item * 0.27777) / 1000;
      }
    });
  }

}