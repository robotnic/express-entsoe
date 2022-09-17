export interface Entsoe {
  GL_MarketDocument?: EntsoeDocument
  Publication_MarketDocument?: EntsoeDocument
  Acknowledgement_MarketDocument?: ErrorDocument
}

export interface EntsoeDocument {
  TimeSeries: TimeSeries[],
  'period.timeInterval'?: TimeInterval[]
  'time_Period.timeInterval'?: TimeInterval[],
  type?: string[]
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

export interface MktPSRType {
  psrType?: string[],
  PowerSystemResources?: PowerSystemResource[]
}
export interface EntsoePoint {
  position: string[]
  quantity?: string[]
  'price.amount'?: string[]
}

export interface PowerSystemResource {
  mRID: mRID[]
  name: string[]
}
export interface mRID {
  _:string
}

export interface ErrorDocument {
  mRID: string
  Reason: Reason[]
}

interface Reason {
  code: string[]
  text: string[]
}