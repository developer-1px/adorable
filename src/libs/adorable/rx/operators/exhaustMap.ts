import {lift} from "../internal/lift"
import {Observable, Subscription} from "../observable/observable"

export const exhaustMap = <T, R>(project:(value:T, index:number) => Promise<R>|Observable<R>|R) => lift<T, R>(observer => {
  let index = 0
  let completed = false
  let subscription:Subscription

  const exhaustMapObserver = Object.setPrototypeOf({
    complete() {
      completed && observer.complete()
    }
  }, observer)

  return {
    next(value:T) {
      if (subscription && !subscription.closed) return
      subscription = Observable.castAsync(project(value, index++)).subscribe2(exhaustMapObserver)
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
    exhaustMap<R>(project:(value:T, index:number) => Promise<R>|Observable<R>|R):Observable<R>
  }
}

// @ts-ignore
// eslint-disable-next-line prefer-rest-params
Observable.prototype.exhaustMap = function() {return exhaustMap(...arguments)(this)}