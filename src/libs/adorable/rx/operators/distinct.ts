import {lift} from "../internal/lift"
import {Observable, Subscription} from "../observable/observable"

const itself = (a:any) => a

export const distinct = <T>(keySelector:(item:T) => string|number = itself, flushes?:Observable) => lift<T, T>(observer => {
  let s:Subscription
  let isExist = Object.create(null)

  return {
    start() {
      if (flushes) s = flushes.subscribe2(() => (isExist = Object.create(null)))
    },

    next(value:T) {
      const key = keySelector(value)
      if (isExist[key]) return
      isExist[key] = true
      observer.next(value)
    },

    cleanup() {
      s && s.unsubscribe()
    }
  }
})

declare module "../observable/observable" {
  interface Observable<T> {
    distinct(compare?:(prev:T, curr:T) => boolean):Observable<T>
  }
}

// eslint-disable-next-line prefer-rest-params
Observable.prototype.distinctUntilChanged = function() {return distinct(...arguments)(this)}