import {lift} from "../internal/lift"
import {Observable, Subscription} from "../observable/observable"
import {castAsync} from "../operator/castAsync"
import type {Asyncable} from "../types"

export const delayWhen = <T>(delayDurationSelector:(value:T, index:number) => Asyncable<any>) => lift<T, T>(observer => {
  let index = 0
  let completed = false
  let subscriptions:Subscription[] = []

  return {
    next(value:T) {
      const s = castAsync(delayDurationSelector(value, index++)).subscribe2(() => {
        observer.next(value)
        if (completed) observer.complete()
        s.unsubscribe()
      })

      subscriptions = [...subscriptions, s].filter(s => !s.closed)
    },

    complete() {
      completed = true
    },

    cleanup() {
      for (const s of subscriptions) s.unsubscribe()
    }
  }
})

declare module "../observable/observable" {
  interface Observable<T> {
    delayWhen(delayDurationSelector:(value:T, index:number) => Asyncable<any>):Observable<T>
  }
}

// eslint-disable-next-line prefer-rest-params
Observable.prototype.delayWhen = function() {return delayWhen(...arguments)(this)}