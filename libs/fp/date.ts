import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"
import utc from "dayjs/plugin/utc"

// @NOTE: 사파리에서 dayjs.extend시 dayjs를 찾지 못하는 버그가 있어서 window에 등록함.
// @ts-ignore
window.dayjs = dayjs
dayjs.extend(utc)
dayjs.extend(customParseFormat)

const tokenizer = (lex:[RegExp, Function][], ...params:any[]) => {
  const regex = new RegExp(lex.map(sep => sep[0].source).join("|"), "g")

  return (format:string) => {
    const result:Function[] = []

    format.replace(regex, (a:string, ...args:any[]) => {
      const index = args.findIndex(value => value !== undefined)
      lex[index][1] && result.push(lex[index][1](a, ...params))
      return a
    })

    return result
  }
}

const itself2 = (x:any) => () => x
const pad = (x:number) => x < 10 ? "0" + x : "" + x
const hour12 = (h:number) => h % 12 === 0 ? 12 : h % 12

const DAY_NAME_KO = ["일", "월", "화", "수", "목", "금", "토"]


const lex:[RegExp, Function][] = [
  [/(\\.)/, (x:string) => () => x],
  [/(yyyy)/, () => (date:Date) => date.getFullYear()],
  [/(mm)/, () => (date:Date) => pad(date.getMonth() + 1)],
  [/(m)/, () => (date:Date) => date.getMonth() + 1],
  [/(dddd:ko)/, () => (date:Date) => DAY_NAME_KO[date.getDay()] + "요일"],
  [/(ddd:ko)/, () => (date:Date) => DAY_NAME_KO[date.getDay()]],
  [/(dd)/, () => (date:Date) => pad(date.getDate())],
  [/(d)/, () => (date:Date) => date.getDate()],
  [/(HH)/, () => (date:Date) => pad(hour12(date.getHours()))],
  [/(H)/, () => (date:Date) => hour12(date.getHours())],
  [/(hh)/, () => (date:Date) => pad(date.getHours())],
  [/(h)/, () => (date:Date) => date.getHours()],
  [/(ii)/, () => (date:Date) => pad(date.getMinutes())],
  [/(i)/, () => (date:Date) => date.getMinutes()],
  [/(ss)/, () => (date:Date) => pad(date.getSeconds())],
  [/(s)/, () => (date:Date) => date.getSeconds()],
  [/(오전)/, () => (date:Date) => date.getHours() < 12 ? "오전" : "오후"],
  [/(.)/, itself2],
]

export const createDateFormat = (format:string, locale = "kr") => {
  const formatter = tokenizer(lex, locale)(format)
  return (date:Date) => {
    date = new Date(date || new Date())
    return formatter.map(fn => fn(date)).join("")
  }
}

const dateFormatMemo = Object.create(null)
export const dateFormat = (format:string, date:Date):string => (dateFormatMemo[format] = dateFormatMemo[format] || createDateFormat(format))(+dayjs(date))

export const __dateTime = (date:Date, hours:number = 0, minutes:number = 0, seconds:number = 0) => {
  date = new Date(date)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes, seconds)
}

export const __dateOffset = (date:Date|number, unit:string, offset:number):Date => {
  date = new Date(date || new Date())
  switch (unit) {
    case "minute":
    case "minutes":
      date.setMinutes(date.getMinutes() + offset)
      return date

    case "hour":
    case "hours":
      date.setHours(date.getHours() + offset)
      return date

    case "month":
    case "months":
      date.setMonth(date.getMonth() + offset)
      return date

    case "day":
    case "date": {
      date.setDate(date.getDate() + offset)
      return date
    }
  }

  throw new TypeError(unit + " is not supported. 필요하면 추가해라!")
}


export const isSameDate = (d1:DateTime, d2:DateTime) => d1 && d2 && dateFormat("yyyy-mm-dd", d1) === dateFormat("yyyy-mm-dd", d2)

export type DateAble = number|string|Date

// @ts-ignore
export class DateTime extends Date {
  static now():DateTime {
    return new DateTime(+new Date())
  }

  static today():DateTime {
    return DateTime.now().time()
  }

  static from(a:DateAble, format?:string):DateTime {
    if (+a !== 0 && !a) return new DateTime(NaN)
    if (format) return new DateTime(+dayjs(a, format))
    return new DateTime(+dayjs(a))
  }

  static min(a:DateAble, b:DateAble, ...args:DateAble[]):DateTime {
    return new DateTime([a, b, ...args].reduce((a, b) => +a < +b ? a : b))
  }

  static max(a:DateAble, b:DateAble, ...args:DateAble[]):DateTime {
    return new DateTime([a, b, ...args].reduce((a, b) => +a > +b ? a : b))
  }

  // @TODO: javascript에서 month을 더할때는 끝날짜 계산이 제대로 안되는 버그가 있다. 8월 31에서 1달을 더하면 9월 30일이 아니라 9/31 -> 10/1로 된다. 나중에 수정해서 moment 의존성을 벗어나자!
  add({years = 0, months = 0, weeks = 0, days = 0, hours = 0, minutes = 0, seconds = 0, milliseconds = 0}):DateTime {
    // eslint-disable-next-line prefer-rest-params
    if (typeof arguments[0] === "function") return this.add(arguments[0](this))
    let ret = dayjs(this)
    if (years) ret = ret.add(years, "year")
    if (months) ret = ret.add(months, "month")
    if (weeks) ret = ret.add(weeks, "week")
    if (days) ret = ret.add(days, "day")
    if (hours) ret = ret.add(hours, "hour")
    if (minutes) ret = ret.add(minutes, "minutes")
    if (seconds) ret = ret.add(seconds, "seconds")
    if (milliseconds) ret = ret.add(milliseconds, "milliseconds")
    return new DateTime(+ret)
  }

  with({year = NaN, month = NaN, date = NaN, hours = NaN, minutes = NaN, seconds = NaN}):DateTime {
    const ret = new Date(this)
    if (year === year) ret.setFullYear(year)
    if (month === month && date === date) ret.setMonth(month - 1, date)
    else if (month === month) ret.setMonth(month - 1)
    else if (date === date) ret.setDate(date)
    if (hours === hours) ret.setHours(hours)
    if (minutes === minutes) ret.setMinutes(minutes)
    if (seconds === seconds) ret.setSeconds(seconds)
    return new DateTime(ret)
  }

  time(hours = 0, minutes = 0, seconds = 0, milliseconds = 0) {
    const ret = new Date(this)
    ret.setHours(hours)
    ret.setMinutes(minutes)
    ret.setSeconds(seconds)
    ret.setMilliseconds(milliseconds)
    return new DateTime(ret)
  }

  startOf(type:"day"|"week"|"month"|"year"):DateTime {
    const date = new DateTime(this).time(0)
    switch (type) {
      case "day": {return date.time(0)}
      case "week": {return date.add({days: -date.getDay()})}
      case "month": {return date.with({date: 1})}
      case "year": {return date.with({month: 1})}
    }
    return date
  }

  endOf(type:"day"|"week"|"month"|"year") {
    const date = new DateTime(this).time(0)
    switch (type) {
      case "day": {return date.startOf("day").add({days: +1, milliseconds: -1})}
      case "week": {return date.add({days: -date.getDay() + 7})}
      case "month": {return date.add({months: +1}).with({date: 1})}
    }
    return date
  }

  format(format:string):string {
    return dateFormat(format, this)
  }

  toDate() {return new Date(this)}

  get year() {return this.getFullYear()}

  get month() {return this.getMonth() + 1}

  get date() {return this.getDate()}

  get hours() {return this.getHours()}

  get minutes() {return this.getMinutes()}

  get seconds() {return this.getSeconds()}
}