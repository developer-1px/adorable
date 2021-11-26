import {lift} from "../internal/lift"
import {Observable, Subscription} from "../observable/observable"
import {take} from "./take"

export const throttle = <T>(durationSelector:(...args:any[]) => Observable<any>) => lift<T, T>(observer => {
  let emitValue:T
  let hasValue = false
  let s:Subscription

  const next = (value:T) => {
    hasValue = true
    emitValue = value

    if (!s) {
      hasValue = false
      observer.next(value)
    }

    if (s && !s.closed) {
      return
    }

    s = take(1)(durationSelector(value)).subscribe({
      next() {
        if (hasValue) observer.next(emitValue)
        hasValue = false
      }
    })
  }

  // const next2 = (value:T) => {
  //   hasValue = true
  //   emitValue = value
  // }

  return {next, cleanup() {s && s.unsubscribe()}}
})


declare module "../observable/observable" {
  interface Observable<T> {
    throttle(durationSelector:(...args:any[]) => Observable<any>):Observable<T>
  }
}

// @ts-ignore
// eslint-disable-next-line prefer-rest-params
Observable.prototype.throttle = function() {return throttle(...arguments)(this)}