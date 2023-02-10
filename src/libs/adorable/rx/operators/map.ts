import {lift} from "../internal/lift"
import {Observable} from "../observable/observable"

export const map = <T, R>(project:(value:T, index:number) => R) => lift<T, R>(observer => {
  let index = 0
  return {
    next(value:T) {
      observer.next(project(value, index++))
    }
  }
})

declare module "../observable/observable" {
  interface Observable<T> {
    map<R>(project:(value:T, index:number) => R):Observable<R>
  }
}

// eslint-disable-next-line prefer-rest-params
Observable.prototype.map = function() {return map(...arguments)(this)}