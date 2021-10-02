export class InputError extends Error {
  status = 400;
  code = 'InputError';
  constructor(message:string) {
    super(message)
    Object.setPrototypeOf(this, InputError.prototype);

  }
}