import {lift} from "../internal/lift"
import {Observable, Subscription} from "../observable/observable"
import {castAsync} from "../operator/castAsync"
import type {Asyncable} from "../types"

export const switchMap = <T, R>(project:(value:T, index:number) => Asyncable<R>) => lift<T, R>(observer => {
  let index = 0
  let completed = false
  let subscription:Subscription

  const switchMapObserver = Object.setPrototypeOf({
    complete() {
      completed && observer.complete()
    }
  }, observer)

  return {
    next(value:T) {
      if (subscription) subscription.unsubscribe()
      subscription = castAsync(project(value, index++)).subscribe2(switchMapObserver)
    },

    complete() {
      completed = true
      if (!subscription || (subscription && subscription.closed)) {
        observer.complete()
      }
    },

    cleanup() {
      if (subscription) subscription.unsubscribe()
    }
  }
})

declare module "../observable/observable" {
  interface Observable<T> {
    switchMap<R>(project:(value:T, index:number) => Asyncable<R>):Observable<R>
  }
}

// eslint-disable-next-line prefer-rest-params
Observable.prototype.switchMap = function() {return switchMap(...arguments)(this)}