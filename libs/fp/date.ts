const tokenizer = (lex, ...params) => {
  const regex = new RegExp(lex.map(sep => sep[0].source).join("|"), "g")

  return (format) => {
    const result = []

    format.replace(regex, (a, ...args) => {
      const index = args.findIndex(value => value !== undefined)
      lex[index][1] && result.push(lex[index][1](a, ...params))
    })

    return result
  }
}

const itself2 = x => () => x
const pad = (x) => x < 10 ? "0" + x : "" + x
const hour12 = (h) => h % 12 === 0 ? 12 : h % 12

const DAY_NAME_KO = ["일", "월", "화", "수", "목", "금", "토"]


const lex = [
  [/(\\.)/, (x) => date => x],
  [/(yyyy)/, () => date => date.getFullYear()],
  [/(mm)/, () => date => pad(date.getMonth() + 1)],
  [/(m)/, () => date => date.getMonth() + 1],
  [/(dddd:ko)/, () => date => DAY_NAME_KO[date.getDay()] + "요일"],
  [/(ddd:ko)/, () => date => DAY_NAME_KO[date.getDay()]],
  [/(dd)/, () => date => pad(date.getDate())],
  [/(d)/, () => date => date.getDate()],
  [/(HH)/, () => date => pad(hour12(date.getHours()))],
  [/(H)/, () => date => hour12(date.getHours())],
  [/(hh)/, () => date => pad(date.getHours())],
  [/(h)/, () => date => date.getHours()],
  [/(ii)/, () => date => pad(date.getMinutes())],
  [/(i)/, () => date => date.getMinutes()],
  [/(ss)/, () => date => pad(date.getSeconds())],
  [/(s)/, () => date => date.getSeconds()],
  [/(오전)/, () => date => date.getHours() < 12 ? "오전" : "오후"],
  [/(.)/, itself2],
]

export const createDateFormat = (format: string, locale = "kr") => {
  const formatter = tokenizer(lex, locale)(format)
  return (date) => {
    date = new Date(date || new Date())
    return formatter.map(fn => fn(date)).join("")
  }
}

export const dateFormat = (format, date) => {
  dateFormat[format] = format[format] || createDateFormat(format)
  return dateFormat[format](date)
}

export const __dateTime = (date, hours = 0, minutes = 0, seconds = 0) => {
  date = new Date(date)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes, seconds)
}

export const __today = () => __dateTime(new Date())

export const __dateOffset = (date, unit, offset) => {
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