import {Observable} from "../observable/observable"
import {lift} from "../internal/lift"

export const mergeAll = <T>() => lift<T, T[]>(observer => {
  const ret:T[] = []
  return {
    next(value) {
      ret.push(value)
    },
    complete() {
      observer.next(ret)
    }
  }
})

declare module "../observable/observable" {
  interface Observable<T> {
    mergeAll(project:(value:T, index:number) => T[]):Observable<T[]>
  }
}

// @ts-ignore
Observable.prototype.mergeAll = function() { return mergeAll(...arguments)(this) }