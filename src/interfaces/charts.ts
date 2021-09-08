export interface ChartGroup {
  title: string
  unit?: string
  chartData: Chart[]
  source: string
}

export interface Chart {
  label?: string
  prsType?: string
  data: Point[]
}

export interface Point {
  x: number
  y: number
}

