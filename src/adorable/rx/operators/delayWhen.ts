import {Observable, Subscription} from "../observable/observable"
import {lift} from "../internal/lift"

export const delayWhen = <T>(delayDurationSelector:(value:T, index:number) => Observable<any>) => lift<T, T>(observer => {
  let index = 0
  let completed = false
  let subscriptions:Subscription[] = []

  return {
    next(value) {
      const s = delayDurationSelector(value, index++).subscribe(() => {
        observer.next(value)
        if (completed) observer.complete()
        s.unsubscribe()
      })

      subscriptions = [...subscriptions, s].filter(s => !s.closed)
    },

    complete() {
      completed = true
    },

    finalize() {
      for (const s of subscriptions) s.unsubscribe()
    }
  }
})

declare module "../observable/observable" {
  interface Observable<T> {
    delayWhen<T>(delayTime:number):Observable<T>
  }
}

// @ts-ignore
Observable.prototype.delayWhen = function() { return delayWhen(...arguments)(this) }