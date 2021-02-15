import {Observable} from "../observable/observable"
import {lift} from "../internal/lift"

export const takeLast = <T>(count:number) => lift<T, T[]>(observer => {
  let history:T[] = []
  return {
    next(value) {
      history.push(value)
      history = history.slice(-count)
    },

    complete() {
      observer.next(history)
      observer.complete()
    },

    finalize() {
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
Observable.prototype.takeLast = function() { return takeLast(...arguments)(this) }