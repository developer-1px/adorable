import {Observable, Subscription} from "../observable/observable"
import {lift} from "../internal/lift"
import type {Asyncable} from "../operator/castAsync"

export const mergeMap = <T, R>(project:(value:T, index:number) => Asyncable<R>) => lift<T, R>((observer) => {
  let index = 0
  let completed = false
  const subscriptions:Subscription[] = []

  const complete = () => completed && subscriptions.every(s => s.closed) && observer.complete()
  const mergeMapObserver = Object.setPrototypeOf({complete}, observer)

  return {
    next(value) {
      subscriptions.push(Observable.castAsync(project(value, index++)).subscribe(mergeMapObserver))
    },

    complete() {
      completed = true
      complete()
    },

    finalize() {
      for (const subscription of subscriptions) subscription.unsubscribe()
    }
  }
})



declare module "../observable/observable" {
  interface Observable<T> {
    mergeMap<R>(project:(value:T, index:number) => Asyncable<R>):Observable<R>
  }
}

// @ts-ignore
Observable.prototype.mergeMap = function() { return mergeMap(...arguments)(this) }