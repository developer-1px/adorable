import {lift} from "../internal/lift"
import {Observable} from "../observable/observable"

// @TODO: inclusive
export const takeWhile = <T>(predicate:(value:T, index:number) => boolean) => lift<T, T>(observer => {
  let index = 0
  return {
    next(value:T) {
      if (predicate(value, index++)) {
        observer.next(value)
      }
      else {
        observer.complete()
      }
    }
  }
})

declare module "../observable/observable" {
  interface Observable<T> {
    takeWhile(predicate:(value:T, index:number) => boolean):Observable<T>
  }
}

// eslint-disable-next-line prefer-rest-params
Observable.prototype.takeWhile = function() {return takeWhile(...arguments)(this)}