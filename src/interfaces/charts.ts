export interface ChartGroup {
  title: string
  country: string
  hrDate: string
  chartType: string
  chartName: string
  unit?: string
  chartData: Chart[]
  source: string
  period: Period
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

export interface Period {
  start: string
  end: string
}