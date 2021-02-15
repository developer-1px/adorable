import {Observable} from "../observable/observable"
import {lift} from "../internal/lift"

export const count = <T>() => lift<T, number>(observer => {
  let count = 0
  return {
    next(value) {count++},
    complete() {
      observer.next(count)
      observer.complete()
    }
  }
})

declare module "../observable/observable" {
  interface Observable<T> {
    count():Observable<number>
  }
}

// @ts-ignore
Observable.prototype.count = function() { return count(...arguments)(this) }