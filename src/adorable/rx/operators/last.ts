import {Observable} from "../observable/observable"
import {lift} from "../internal/lift"

export const last = <T>() => lift<T, T>(observer => {
  let ret:T
  return {
    next(value) {
      ret = value
    },

    complete() {
      observer.next(ret)
      observer.complete()
    }
  }
})

declare module "../observable/observable" {
  interface Observable<T> {
    last():Observable<T>
  }
}

// @ts-ignore
Observable.prototype.last = function() { return last(...arguments)(this) }