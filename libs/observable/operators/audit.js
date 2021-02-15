import {Observable} from "../observable"
import {lift} from "../observable.operators"

export const audit = (callback) => lift((observer, s, lastValue) => ({

  next(value) {
    lastValue = value
    if (s && !s.closed) return

    s = Observable.castAsync(callback(lastValue)).subscribe({
      complete() {
        observer.next(lastValue)
      }
    })
  },

  finalize() {
    if (s) s.unsubscribe()
  }
}))

export const auditTime = (duration) => audit(() => Observable.timer(duration))
