import {lift} from "../internal/lift"
import {Observable} from "../observable/observable"

const scan1 = (accumulator:any) => lift(observer => {
  let prev:any
  let index = 0

  // @ts-ignore
  const next = (value) => observer.next(prev = value) & (ret.next = next2)
  const next2 = (value:any) => observer.next((prev = accumulator(prev, value, ++index)))

  const ret = {next}
  return ret
})

const scan2 = (accumulator:any, seed:any) => lift(observer => {
  let prev = seed
  let index = 0
  return {
    next(value) {
      observer.next((prev = accumulator(prev, value, index++)))
    }
  }
})

export interface scan {
  <T>(accumulator:(prev:T, curr:T, index:number) => T):Observable<T>
  <T>(accumulator:(prev:T, curr:T, index:number) => T, seed:T):Observable<T>
  <T, R>(accumulator:(prev:T|R, curr:T, index:number) => R):Observable<R>
  <T, R>(accumulator:(prev:R, curr:T, index:number) => R, seed:R):Observable<R>
}

export function scan(accumulator:any, seed:any) {
  return arguments.length >= 2 ? scan2(accumulator, seed) : scan1(accumulator)
}

declare module "../observable/observable" {
  interface Observable<T> {
    scan(accumulator:(prev:T, curr:T, index:number) => T):Observable<T>
    scan(accumulator:(prev:T, curr:T, index:number) => T, seed:T):Observable<T>
    scan<R>(accumulator:(prev:T|R, curr:T, index:number) => R):Observable<R>
    scan<R>(accumulator:(prev:R, curr:T, index:number) => R, seed:R):Observable<R>
  }
}

// eslint-disable-next-line prefer-rest-params
Observable.prototype.scan = function() {return scan(...arguments)(this)}