export interface ChartGroup {
  title: string
  country: string
  countryCode: string
  humanReadableDate: string
  chartType: string
  chartName: string
  unit?: string
  dataset: Chart[]
  sources?: Source[]
  requestInterval: Interval
  dataInterval?: Interval
}

export interface Chart {
  label?: string
  psrType?: string
  color?: string
  data?: Point[]
  value?: number
  intervalInHours?: number
}

export interface Source {
  title?: string
  description?: string
  url?: string
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