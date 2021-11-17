import {lift} from "../internal/lift"
import {Observable} from "../observable/observable"
import type {Falsy} from "../types"

export const filter = <T>(predicate:(value:T, index:number) => boolean) => lift<T, T>(observer => {
  let index = 0
  return {
    next(value:T) {
      if (predicate(value, index++)) {
        observer.next(value)
      }
    }
  }
})

declare module "../observable/observable" {
  interface Observable<T> {
    filter(predicate:BooleanConstructor):Observable<Exclude<T, Falsy>>
    filter(predicate:(value:T, index:number) => boolean|any):Observable<T>
    filter<R extends T>(predicate:(value:T, index:number) => boolean|any):Observable<R>
  }
}

// @ts-ignore
// eslint-disable-next-line prefer-rest-params
Observable.prototype.filter = function() {return filter(...arguments)(this)}