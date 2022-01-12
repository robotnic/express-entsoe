import {formatISO, addDays, addMonths, addWeeks, addYears, format, getDaysInMonth, setDate, setISOWeek, setMonth, startOfWeek, setWeek } from 'date-fns';
import { formatInTimeZone, utcToZonedTime } from 'date-fns-tz'

import { InputError } from './Errors';
import QueryString from "qs";


export class Datevalidator {
  static parsePeriod(query: QueryString.ParsedQs): [string, string] {
    return [
      this.getPeriod(query.periodStart),
      this.getPeriod(query.periodEnd)
    ]
  }

  static getYear(query: QueryString.ParsedQs):[string, string] {
    const periodStart = `${query.year}01010000`;
    const periodEnd = `${query.year}12310000`;
    return [periodStart, periodEnd]
  }

  static getStartEnd(query: QueryString.ParsedQs): [string, string] {
    const year = this.checkYear(query.year);
    if (year) {
      let startDate = new Date(`${year}-01-01T00:00:00Z`);
      let endDate = addYears(startDate, 1);
      const month = this.checkMonth(query.month);
      if (typeof (month) === 'number') {
        if (query.week) {
          throw new InputError('query parameter month and week cannot be used at the same time');
        }
        startDate = setMonth(startDate, month)
        endDate = addMonths(startDate, 1);
        const day = this.checkDay(year, month, query.day);
        if (day) {
          startDate = setDate(startDate, day)
          endDate = addDays(startDate, 1);
        }
      } else {
        if (query.week) {
          const week = this.checkWeek(query.week);
          startDate = addMonths(startDate, 1);
          startDate = startOfWeek(setWeek(startDate, week));
          console.log('startDate', startDate)
          startDate = addDays(startDate,1);
          endDate = addWeeks(startDate, 1);
          console.log('endDate', endDate)
        }
      }
      const periodStart = formatInTimeZone(startDate, 'UTC', 'yyyyMMdd0000')
      const periodEnd = formatInTimeZone(endDate, 'UTC', 'yyyyMMdd0000')
      return [periodStart, periodEnd]
    } else {
      return this.parsePeriod(query);
    }
  }

  static getPeriod(period: string | QueryString.ParsedQs | string[] | QueryString.ParsedQs[] | undefined): string {
    if (typeof (period) !== 'string') {
      throw new InputError('period should be a string');
    }
    if (period.length !== 12) {
      throw new InputError('period should have 12 character. Example: 201611012300');
    }
    return period;
  }


  static checkYear(year: string | QueryString.ParsedQs | string[] | QueryString.ParsedQs[] | undefined):string {
    const yearRegExp = new RegExp('^\\d{4}$');
    if (typeof (year) !== 'string') {
      throw new InputError('query parameter year required');
    }
    if (!yearRegExp.test(year)) {
      throw new InputError('query parameter year must have four digits. Example: 2019');
    }
    return year;
  }

  static checkMonth(month: string | QueryString.ParsedQs | string[] | QueryString.ParsedQs[] | undefined): number|undefined {
    if (!month) {
      return;
    }
    if (typeof (month) !== 'string') {
      throw new InputError('month has to be a string');
    }
    if (parseInt(month) < 1 || parseInt(month) > 12) {
      throw new InputError('query parameter month must be between 1 and 12. Example: 7');
    }
    return parseInt(month) - 1;
  }

  static checkDay(year: string, month: number, day: string | QueryString.ParsedQs | string[] | QueryString.ParsedQs[] | undefined):number|undefined {
    if (!day) {
      return;
    }
    if (typeof (day) !== 'string') {
      throw new InputError('query parameter day is fishy');
    }
    const daysInMonth = getDaysInMonth(new Date(parseInt(year), month));
    if (parseInt(day) > daysInMonth || parseInt(day) < 1) {
      throw new InputError(`${year}-${month +1} does not have day ${day}`);
    }
    return parseInt(day);
  }

  static checkWeek(week: string | QueryString.ParsedQs | string[] | QueryString.ParsedQs[] | undefined): number {
    if (typeof (week) !== 'string') {
      throw new InputError('query parameter day is fishy');
    }
    if (parseInt(week) < 1 || parseInt(week) > 52) {
      throw new InputError('value for week must be between 1 and 52');
    }
    return parseInt(week);
  }
}

