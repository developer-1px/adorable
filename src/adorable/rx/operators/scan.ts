import {Observable} from "../observable/observable"
import {lift} from "../internal/lift"

const scan1 = <T, R>(accumulator:(prev:R, curr:T, index:number) => R) => lift<T, R>(observer => {
  let prev:R
  let index = 0

  // @ts-ignore
  const next = (value:T) => observer.next(prev = value) & (ret.next = next2)
  const next2 = (value:T) => observer.next((prev = accumulator(prev, value, ++index)))

  const ret = {next}
  return ret
})

const scan2 = <T, R>(accumulator:(prev:R, curr:T, index:number) => R, seed:R) => lift<T, R>(observer => {
  let prev:R = seed
  let index = 0
  return {
    next(value) {
      observer.next((prev = accumulator(prev, value, index++)))
    }
  }
})

export function scan<T>(accumulator:(prev:T, curr:T, index:number) => T):(observable:Observable<T>) => Observable<T>
export function scan<T>(accumulator:(prev:T, curr:T, index:number) => T, seed:T):(observable:Observable<T>) => Observable<T>
export function scan<T, R>(accumulator:(prev:T|R, curr:T, index:number) => R):(observable:Observable<T>) => Observable<R>
export function scan<T, R>(accumulator:(prev:R, curr:T, index:number) => R, seed:R):(observable:Observable<T>) => Observable<R>

export function scan<T, R>(accumulator:(prev:R, curr:T, index:number) => R, seed?:T|R) {
  // @ts-ignore
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

// @ts-ignore
Observable.prototype.scan = function() { return scan(...arguments)(this) }