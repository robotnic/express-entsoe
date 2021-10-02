export interface ChartGroup {
  title: string
  country: string
  humanReadableDate: string
  chartType: string
  chartName: string
  unit?: string
  chartData: Chart[]
  source: string
  requestInterval:Interval
  dataInterval:Interval
}

export interface Chart {
  label?: string
  prsType?: string
  color?: string
  data: Point[]
}

export interface Point {
  x: string
  y: number
}

export interface Interval {
  start?: string
  end?: string
}