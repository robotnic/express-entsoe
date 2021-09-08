export interface Entsoe {
  GL_MarketDocument?: EntsoeDocument
  Publication_MarketDocument?: EntsoeDocument
}

export interface EntsoeDocument {
  TimeSeries: TimeSeries[]
}

interface TimeSeries {
  Period: EntsoePeriod[]
  MktPSRType?: MktPSRType[]
  'outBiddingZone_Domain.mRID':string
}
export interface EntsoePeriod {
  Point: EntsoePoint[]
  resolution: string
  timeInterval: TimeInterval[]
}

interface TimeInterval {
  start: string[]
  end: string[]
}

interface MktPSRType {
  psrType: string[]
}
export interface EntsoePoint {
  position: string[]
  quantity?: string[]
  'price.amount'?: string[]
}