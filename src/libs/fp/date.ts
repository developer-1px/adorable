import dayjs, {OpUnitType} from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"
import timezone from "dayjs/plugin/timezone"
import utc from "dayjs/plugin/utc"

// @NOTE: 사파리에서 dayjs.extend시 dayjs를 찾지 못하는 버그가 있어서 window에 등록함.
// @ts-ignore
window.dayjs = dayjs
dayjs.extend(utc)
dayjs.extend(timezone)
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
const DAY_NAME_EN = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
const DAY_NAME_KO2 = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"]
const DAY_NAME_EN2 = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

const MONTH_NAME = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

const lex:[RegExp, Function][] = [
  [/(\\.)/, (x:string) => () => x],
  [/(yyyy)/, () => (date:Date) => date.getFullYear()],
  [/(mmmm)/, () => (date:Date) => MONTH_NAME[date.getMonth()]],
  [/(mm)/, () => (date:Date) => pad(date.getMonth() + 1)],
  [/(m)/, () => (date:Date) => date.getMonth() + 1],
  [/(dddd:ko)/, () => (date:Date) => DAY_NAME_KO2[date.getDay()]],
  [/(ddd:ko)/, () => (date:Date) => DAY_NAME_KO[date.getDay()]],
  [/(dddd)/, () => (date:Date) => DAY_NAME_EN2[date.getDay()]],
  [/(ddd)/, () => (date:Date) => DAY_NAME_EN[date.getDay()]],
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
  [/(AM|PM)/, () => (date:Date) => date.getHours() < 12 ? "AM" : "PM"],
  [/(오전|오후)/, () => (date:Date) => date.getHours() < 12 ? "오전" : "오후"],
  [/(.)/, itself2],
]

export const createDateFormat = (format:string, locale = "kr") => {
  const formatter = tokenizer(lex, locale)(format)
  return (date:Date) => {
    date = DateTime.from(date)
    return formatter.map(fn => fn(date)).join("")
  }
}

const dateFormatMemo = Object.create(null)

export const dateFormat = (format:string, date:Date):string => (dateFormatMemo[format] = dateFormatMemo[format] || createDateFormat(format))(+dayjs(date))

export const __dateTime = (date:Date, hours = 0, minutes = 0, seconds = 0) => {
  return DateTime.from(date).time(hours, minutes, seconds)
}

export const daysForLocale = (localeName:string, weekday:"narrow"|"short"|"long") => {
  const format = new Intl.DateTimeFormat(localeName, {weekday}).format
  return [...Array(7).keys()].map((day) => format(new Date(Date.UTC(2021, 2, day))))
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

  startOf(type:dayjs.OpUnitType) {return new DateTime(+dayjs(this).startOf(type))}

  endOf(type:dayjs.OpUnitType) {return new DateTime(+dayjs(this).endOf(type))}

  daysInMonth() {
    return new Date(this.getFullYear(), this.getMonth() + 1, 0).getDate()
  }

  format(format:string):string {
    return dateFormat(format, this)
  }

  toDate() {return new Date(this)}

  get year() {return this.getFullYear()}

  get month() {return this.getMonth() + 1}

  get day() {return this.getDate()}

  get date() {return this.getDate()}

  get hour() {return this.getHours()}

  get minute() {return this.getMinutes()}

  get second() {return this.getSeconds()}

  get millisecond() {return this.getMilliseconds()}

  get dayOfWeek() {return this.getDay()}

  // @TODO: dayOfYear, weekOfYear,
  // daysInWeek, daysInMonth, daysInYear

  get minutes() {return this.getMinutes()}

  get isValid() {return !isNaN(this.getTime())}
  get isInValid() {return isNaN(this.getTime())}
}

window.DateTime = DateTime