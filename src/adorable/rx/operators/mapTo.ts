import {Observable} from "../observable/observable"
import {lift} from "../internal/lift"

export const mapTo = <T, R>(value:R) => lift<T, R>(observer => {
  return {
    next() {
      observer.next(value)
    }
  }
})

declare module "../observable/observable" {
  interface Observable<T> {
    mapTo<R>(value:R):Observable<R>
  }
}

Observable.prototype.mapTo = function(...args) { return mapTo(...args)(this) }