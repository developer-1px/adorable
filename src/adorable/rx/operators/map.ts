import {Observable} from "../observable/observable"
import {lift} from "../internal/lift"

export const map = <T, R>(project:(value:T, index:number) => R) => lift<T, R>(observer => {
  let index = 0
  return {
    next(value) {
      observer.next(project(value, index++))
    }
  }
})

declare module "../observable/observable" {
  interface Observable<T> {
    map<R>(project:(value:T, index:number) => R):Observable<R>
  }
}

// @ts-ignore
Observable.prototype.map = function() { return map(...arguments)(this) }