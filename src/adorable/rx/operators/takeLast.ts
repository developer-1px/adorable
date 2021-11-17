import {lift} from "../internal/lift"
import {Observable} from "../observable/observable"

export const takeLast = <T>(count:number) => lift<T, T[]>(observer => {
  let history:T[] = []
  return {
    next(value:T) {
      history.push(value)
      history = history.slice(-count)
    },

    complete() {
      observer.next(history)
      observer.complete()
    },

    cleanup() {
      history = []
    }
  }
})

declare module "../observable/observable" {
  interface Observable<T> {
    takeLast(count:number):Observable<T[]>
  }
}

// @ts-ignore
// eslint-disable-next-line prefer-rest-params
Observable.prototype.takeLast = function() {return takeLast(...arguments)(this)}