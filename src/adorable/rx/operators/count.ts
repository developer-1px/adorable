import {lift} from "../internal/lift"
import {Observable} from "../observable/observable"

export const count = <T>() => lift<T, number>(observer => {
  let count = 0
  return {
    next() {count++},
    complete() {
      observer.next(count)
      observer.complete()
    }
  }
})

declare module "../observable/observable" {
  interface Observable {
    count():Observable<number>
  }
}

// @ts-ignore
// eslint-disable-next-line prefer-rest-params
Observable.prototype.count = function() {return count(...arguments)(this)}