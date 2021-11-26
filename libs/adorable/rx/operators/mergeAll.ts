import {lift} from "../internal/lift"
import {Observable} from "../observable/observable"

export const mergeAll = <T>() => lift<T, T[]>(observer => {
  const ret:T[] = []
  return {
    next(value:T) {
      ret.push(value)
    },
    complete() {
      observer.next(ret)
    }
  }
})

declare module "../observable/observable" {
  interface Observable<T> {
    mergeAll():Observable<T[]>
  }
}

// @ts-ignore
// eslint-disable-next-line prefer-rest-params
Observable.prototype.mergeAll = function() {return mergeAll(...arguments)(this)}