import { EntsoeError } from "./interfaces/charts";

export class InputError extends Error {
  status = 400;
  type = 'InputError';
  constructor(message: string) {
    super(message)
    Object.setPrototypeOf(this, InputError.prototype);
  }
}

export class UpstreamError extends Error {
  constructor(public rfc7807: EntsoeError) {
    super(rfc7807.detail)
    Object.setPrototypeOf(this, UpstreamError.prototype);
  }
}
