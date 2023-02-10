import {lift} from "../internal/lift"
import {Observable} from "../observable/observable"

export const take = <T>(count:number) => lift<T, T>(observer => {
  let _count = count
  return {
    start() {if (_count <= 0) observer.complete()},
    next(value:T) {
      observer.next(value)
      if (--_count <= 0) observer.complete()
    }
  }
})

declare module "../observable/observable" {
  interface Observable<T> {
    take(count:number):Observable<T>
  }
}

// eslint-disable-next-line prefer-rest-params
Observable.prototype.take = function() {return take(...arguments)(this)}