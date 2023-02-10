import {lift} from "../internal/lift"
import {Observable} from "../observable/observable"

export const last = <T>() => lift<T, T>(observer => {
  let ret:T
  return {
    next(value:T) {
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

// eslint-disable-next-line prefer-rest-params
Observable.prototype.last = function() {return last(...arguments)(this)}