export interface ChartGroup {
  title: string
  country: string
  countryCode: string
  humanReadableDate: string
  chartType: string
  chartName: string
  unit?: string
  dataset: Chart[]
  source: string
  requestInterval: Interval
  dataInterval?: Interval
}

export interface Chart {
  label?: string
  prsType?: string
  color?: string
  data?: Point[]
  value?: number
}

export interface Point {
  x: string
  y: number
}

export interface Interval {
  start?: string
  end?: string
}

export interface EntsoeError {
  type: string
  title: string
  status: number
  detail: string
  instance: string
}