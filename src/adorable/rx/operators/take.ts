import {Observable} from "../observable/observable"
import {lift} from "../internal/lift"

export const take = <T>(count:number) => lift<T, T>(observer => {
  let _count = count
  return {
    start() {if (_count <= 0) observer.complete()},
    next(value) {
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

// @ts-ignore
Observable.prototype.take = function() { return take(...arguments)(this) }