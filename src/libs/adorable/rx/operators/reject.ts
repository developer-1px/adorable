import {lift} from "../internal/lift"
import {Observable} from "../observable/observable"
import type {Falsy} from "../types"

export const reject = <T>(predicate:(value:T, index:number) => boolean) => lift<T, T>(observer => {
  let index = 0
  return {
    next(value:T) {
      if (!predicate(value, index++)) {
        observer.next(value)
      }
    }
  }
})

declare module "../observable/observable" {
  interface Observable<T> {
    reject(predicate:BooleanConstructor):Observable<Exclude<T, Falsy>>
    reject(predicate:(value:T, index:number) => boolean|any):Observable<T>
    reject<R extends T>(predicate:(value:T, index:number) => boolean|any):Observable<R>
  }
}

// @ts-ignore
// eslint-disable-next-line prefer-rest-params
Observable.prototype.reject = function() {return reject(...arguments)(this)}