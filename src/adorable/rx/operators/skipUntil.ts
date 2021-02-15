import {Observable} from "../observable/observable"
import {lift} from "../internal/lift"
import {take} from "./take"

export const skipUntil = <T>(notifier:Observable<any>) => lift<T, T>(observer => {
  let hasValue = false
  return {
    start() {
      notifier.pipe(take(1)).subscribe(() => hasValue = true)
    },

    next(value) {
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
Observable.prototype.skipUntil = function() { return skipUntil(...arguments)(this) }