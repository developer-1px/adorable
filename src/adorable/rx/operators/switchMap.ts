import {Observable, Subscription} from "../observable/observable"
import {lift} from "../internal/lift"
import type {Asyncable} from "../operator/castAsync"
import {castAsync} from "../operator/castAsync"

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
    next(value) {
      if (subscription) subscription.unsubscribe()
      subscription = castAsync(project(value, index++)).subscribe(switchMapObserver)
    },

    complete() {
      completed = true
      if (!subscription || (subscription && subscription.closed)) {
        observer.complete()
      }
    },

    finalize() {
      if (subscription) subscription.unsubscribe()
    }
  }
})

declare module "../observable/observable" {
  interface Observable<T> {
    switchMap<R>(project:(value:T, index:number) => Asyncable<R>):Observable<R>
  }
}

// @ts-ignore
Observable.prototype.switchMap = function() { return switchMap(...arguments)(this) }