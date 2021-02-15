import {Observable, Subscription} from "../observable/observable"
import {lift} from "../internal/lift"

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
    next(value) {
      if (subscription && !subscription.closed) return
      subscription = Observable.castAsync(project(value, index++)).subscribe(exhaustMapObserver)
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
    exhaustMap<R>(project:(value:T, index:number) => Promise<R>|Observable<R>|R):Observable<R>
  }
}

// @ts-ignore
Observable.prototype.exhaustMap = function() { return exhaustMap(...arguments)(this) }