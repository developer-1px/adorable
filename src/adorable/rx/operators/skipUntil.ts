import {lift} from "../internal/lift"
import {Observable} from "../observable/observable"
import {take} from "./take"

export const skipUntil = <T>(notifier:Observable<any>) => lift<T, T>(observer => {
  let hasValue = false
  return {
    start() {
      notifier.pipe(take(1)).subscribe(() => hasValue = true)
    },

    next(value:T) {
      if (!hasValue) return
      observer.next(value)
    }
  }
})

declare module "../observable/observable" {
  interface Observable<T> {
    skipUntil(notifier:Observable<any>):Observable<T>
  }
}

// @ts-ignore
// eslint-disable-next-line prefer-rest-params
Observable.prototype.skipUntil = function() {return skipUntil(...arguments)(this)}