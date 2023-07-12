/// array.js
import {__itself} from "./index"

declare global {
  interface Array<T> {
    pipe(callback:(array:Array<T>) => Array<T>):Array<T>
  }
}

// eslint-disable-next-line no-extend-native,node/no-callback-literal
Array.prototype.pipe = function <T>(callback:(array:Array<T>) => Array<T>) {return callback(this)}

export const __array_difference = (a:any[], b:any[], callback = __itself) => a.filter(x => !b.map(callback).includes(callback(x))).concat(b.filter(x => !a.map(callback).includes(callback(x))))

export const __array_unique = <T>(array:T[], callback:((item:T) => any) = (item:T) => item):T[] => {
  const check = Object.create(null)
  const result:T[] = []

  array.forEach(item => {
    const key = callback(item)
    if (key !== null && key !== undefined && !check[key]) {
      check[key] = true
      result.push(item)
    }
  })

  return result
}

export const __array_group_by = <T>(array:T[], makeKeyCallback:((item:T) => string)):Record<string, T[]> => {
  const groupBy = Object.create(null)
  array.forEach(row => {
    const key = makeKeyCallback(row)
    groupBy[key] = groupBy[key] || []
    groupBy[key].push(row)
  })

  return groupBy
}

export const toCollection = <T>(arr:T[], makeKey = (t:T) => String(t)) => {
  const obj:Record<string, T> = Object.create(null)
  ;(arr ?? []).forEach(value => (obj[makeKey(value)] = value))
  return obj
}

export const array_unique = <T>(callback:((item:T) => any) = (item:T) => item) => (array:T[]):T[] => {
  const check = Object.create(null)
  const result:T[] = []

  array.forEach(item => {
    const key = callback(item)
    if (key !== undefined && key !== null && !check[key]) {
      check[key] = true
      result.push(item)
    }
  })

  return result
}

export const array_group_by = <T>(makeKeyCallback:((item:T) => string)) => (array:T[]):Record<string, T[]> => {
  const groupBy = Object.create(null)
  array.forEach(row => {
    const key = makeKeyCallback(row)
    groupBy[key] = groupBy[key] || []
    groupBy[key].push(row)
  })

  return groupBy
}

export const array_to_record = <T>(makeKey = (t:T) => String(t)) => (arr:T[]) => {
  const obj:Record<string, T> = Object.create(null)
  arr.forEach(value => (obj[makeKey(value)] = value))
  return obj
}