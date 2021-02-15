import {Observable} from "../observable/observable"
import {lift} from "../internal/lift"

export const filter = <T>(predicate:(value:T, index:number) => boolean) => lift<T, T>(observer => {
  let index = 0
  return {
    next(value) {
      if (predicate(value, index++)) {
        observer.next(value)
      }
    }
  }
})

declare module "../observable/observable" {
  interface Observable<T> {
    filter(predicate:(value:T, index:number) => boolean|any):Observable<T>
    filter<R extends T>(predicate:(value:T, index:number) => boolean|any):Observable<R>
  }
}

// @ts-ignore
Observable.prototype.filter = function() { return filter(...arguments)(this) }