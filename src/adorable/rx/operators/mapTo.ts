import {lift} from "../internal/lift"
import {Observable} from "../observable/observable"

export const mapTo = <T, R>(value:R) => lift<T, R>(observer => {
  return {
    next() {
      observer.next(value)
    }
  }
})

declare module "../observable/observable" {
  interface Observable {
    mapTo<R>(value:R):Observable<R>
  }
}

Observable.prototype.mapTo = function(...args) {return mapTo(...args)(this)}